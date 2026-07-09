import { HttpClient } from "./http.js";
import {
  BeautyResource,
  DetectResource,
  EditResource,
  EnhanceResource,
  FilesResource,
  GenerateResource,
  RemoveResource,
  TryOnResource,
  UtilityResource,
  VideoResource,
} from "./resources.js";
import type { RequestOptions } from "./types.js";

export interface SnapEditOptions {
  /** Your SnapEdit API key (starts with `sk-snap-`). */
  apiKey: string;
  /** Override the API base URL. Default: https://api.snapedit.app/v1 */
  baseURL?: string;
  /** How to send the key: "bearer" (default) or "api-key" header. */
  authScheme?: "bearer" | "api-key";
  /** Per-request timeout in ms. Default: 60000. */
  timeout?: number;
  /** Automatic retries on 429/5xx/network errors. Default: 2. */
  maxRetries?: number;
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof fetch;
  /** Extra headers sent with every request. */
  defaultHeaders?: Record<string, string>;
}

const DEFAULT_BASE_URL = "https://api.snapedit.app/v1";

/**
 * SnapEdit API client.
 *
 * ```ts
 * const client = new SnapEdit({ apiKey: process.env.SNAPEDIT_API_KEY! });
 * const out = await client.remove.background({ input_image: "https://.../photo.jpg" });
 * console.log(out.data[0].url);
 * ```
 */
export class SnapEdit {
  private readonly http: HttpClient;

  readonly detect: DetectResource;
  readonly remove: RemoveResource;
  readonly enhance: EnhanceResource;
  readonly generate: GenerateResource;
  readonly edit: EditResource;
  readonly beauty: BeautyResource;
  readonly utility: UtilityResource;
  readonly tryOn: TryOnResource;
  readonly video: VideoResource;
  readonly files: FilesResource;

  constructor(options: SnapEditOptions) {
    if (!options?.apiKey) {
      throw new Error("SnapEdit: `apiKey` is required.");
    }
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new Error(
        "SnapEdit: no global fetch found. Use Node 18+ or pass `fetch` in options."
      );
    }

    this.http = new HttpClient({
      apiKey: options.apiKey,
      baseURL: (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
      authScheme: options.authScheme ?? "bearer",
      timeout: options.timeout ?? 60_000,
      maxRetries: options.maxRetries ?? 2,
      fetch: fetchImpl.bind(globalThis),
      defaultHeaders: options.defaultHeaders,
    });

    this.detect = new DetectResource(this.http);
    this.remove = new RemoveResource(this.http);
    this.enhance = new EnhanceResource(this.http);
    this.generate = new GenerateResource(this.http);
    this.edit = new EditResource(this.http);
    this.beauty = new BeautyResource(this.http);
    this.utility = new UtilityResource(this.http);
    this.tryOn = new TryOnResource(this.http);
    this.video = new VideoResource(this.http);
    this.files = new FilesResource(this.http);
  }

  /** Rate-limit info from the most recent response. */
  get rateLimit() {
    return this.http.rateLimit;
  }

  /** Unauthenticated health check. */
  health(opts?: RequestOptions): Promise<{
    status: string;
    checks: Record<string, string>;
    timestamp: string;
  }> {
    return this.http.get("/health", opts);
  }
}

export default SnapEdit;
export { SnapEditError, SnapEditTaskError } from "./error.js";
export * from "./types.js";
export type {
  BeautyResource,
  DetectResource,
  EditResource,
  EnhanceResource,
  FilesResource,
  GenerateResource,
  RemoveResource,
  TryOnResource,
  UtilityResource,
  VideoResource,
} from "./resources.js";
