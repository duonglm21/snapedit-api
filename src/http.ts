import { SnapEditError } from "./error.js";
import type { FileInput, RateLimit, RequestOptions } from "./types.js";

export interface HttpClientConfig {
  apiKey: string;
  baseURL: string;
  /** Send key as `Authorization: Bearer` (default) or `api-key` header. */
  authScheme: "bearer" | "api-key";
  timeout: number;
  maxRetries: number;
  fetch: typeof fetch;
  defaultHeaders?: Record<string, string>;
}

const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

/**
 * Turn any accepted file input into something FormData can accept.
 * URLs and local file paths are passed through / read; binary data is wrapped.
 */
async function toFormValue(value: FileInput): Promise<Blob | string> {
  if (typeof value === "string") {
    // A URL — send as-is; the API fetches it server-side.
    if (/^https?:\/\//i.test(value)) return value;
    // A local file path — read it (Node only).
    if (isNode) {
      const { readFile } = await import("node:fs/promises");
      const buf = await readFile(value);
      return new Blob([new Uint8Array(buf)]);
    }
    // In the browser, a bare string that isn't a URL is ambiguous.
    return value;
  }
  if (value instanceof Blob) return value;
  if (value instanceof ArrayBuffer) return new Blob([new Uint8Array(value)]);
  // Copy into a fresh Uint8Array so the backing buffer is a plain ArrayBuffer.
  // Node Buffer is a Uint8Array subclass, so this covers it too.
  return new Blob([Uint8Array.from(value as Uint8Array)]);
}

/** Fields whose values should be treated as file inputs. */
const FILE_FIELDS = new Set([
  "input_image",
  "input_mask",
  "model_image",
  "cloth_image",
  "lower_cloth_image",
  "input_image_0",
  "input_image_1",
  "input_image_2",
]);

export class HttpClient {
  constructor(private readonly cfg: HttpClientConfig) {}

  private authHeaders(): Record<string, string> {
    return this.cfg.authScheme === "api-key"
      ? { "api-key": this.cfg.apiKey }
      : { Authorization: `Bearer ${this.cfg.apiKey}` };
  }

  /** Latest rate-limit info parsed from response headers. */
  rateLimit: RateLimit = { limit: null, remaining: null, reset: null };

  private captureRateLimit(headers: Headers) {
    const limit = headers.get("x-ratelimit-limit-requests");
    const remaining = headers.get("x-ratelimit-remaining-requests");
    const reset = headers.get("x-ratelimit-reset-requests");
    this.rateLimit = {
      limit: limit != null ? Number(limit) : this.rateLimit.limit,
      remaining: remaining != null ? Number(remaining) : this.rateLimit.remaining,
      reset: reset ?? this.rateLimit.reset,
    };
  }

  /** POST a multipart/form-data body built from a flat params object. */
  async postForm<T>(
    path: string,
    params: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    const form = new FormData();
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      if (FILE_FIELDS.has(key)) {
        const v = await toFormValue(value as FileInput);
        if (typeof v === "string") form.append(key, v);
        else form.append(key, v, `${key}.png`);
      } else {
        form.append(key, String(value));
      }
    }
    return this.request<T>("POST", path, { body: form }, options);
  }

  /** POST a JSON body. */
  async postJson<T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(
      "POST",
      path,
      {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      },
      options
    );
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, {}, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, {}, options);
  }

  private async request<T>(
    method: string,
    path: string,
    init: { body?: BodyInit; headers?: Record<string, string> },
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.cfg.baseURL}${path}`;
    const timeout = options?.timeout ?? this.cfg.timeout;

    let attempt = 0;
    // 1 initial try + maxRetries retries.
    while (true) {
      const controller = new AbortController();
      const onAbortExternal = () => controller.abort();
      if (options?.signal) {
        if (options.signal.aborted) controller.abort();
        else options.signal.addEventListener("abort", onAbortExternal);
      }
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await this.cfg.fetch(url, {
          method,
          body: init.body,
          headers: {
            ...this.authHeaders(),
            ...this.cfg.defaultHeaders,
            ...init.headers,
          },
          signal: controller.signal,
        });
        this.captureRateLimit(res.headers);

        if (res.ok) {
          return (await this.parseBody(res)) as T;
        }

        // Retry on 429 and 5xx, if attempts remain.
        const retryable = res.status === 429 || res.status >= 500;
        if (retryable && attempt < this.cfg.maxRetries) {
          const retryAfter = Number(res.headers.get("retry-after"));
          const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(1000 * 2 ** attempt, 8000);
          await sleep(delayMs);
          attempt++;
          continue;
        }

        throw await this.toError(res);
      } catch (err) {
        // Retry transient network errors (not our own SnapEditError).
        if (
          !(err instanceof SnapEditError) &&
          attempt < this.cfg.maxRetries &&
          !(options?.signal?.aborted)
        ) {
          await sleep(Math.min(1000 * 2 ** attempt, 8000));
          attempt++;
          continue;
        }
        throw err;
      } finally {
        clearTimeout(timer);
        options?.signal?.removeEventListener("abort", onAbortExternal);
      }
    }
  }

  private async parseBody(res: Response): Promise<unknown> {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return res.json();
    if (ct.startsWith("image/") || ct.includes("octet-stream")) {
      return res.blob();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private async toError(res: Response): Promise<SnapEditError> {
    let body: unknown;
    let message = `SnapEdit API error (${res.status})`;
    let type: string | undefined;
    let code: number | string | undefined;
    try {
      body = await res.json();
      const e = (body as any)?.error;
      if (e) {
        message = e.message ?? message;
        type = e.type;
        code = e.code;
      }
    } catch {
      body = await res.text().catch(() => undefined);
    }
    const retryAfterHeader = Number(res.headers.get("retry-after"));
    return new SnapEditError(message, {
      status: res.status,
      type,
      code,
      body,
      retryAfter: Number.isFinite(retryAfterHeader) ? retryAfterHeader : undefined,
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
