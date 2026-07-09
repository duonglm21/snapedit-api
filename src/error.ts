/** Error thrown for any non-2xx response from the SnapEdit API. */
export class SnapEditError extends Error {
  /** HTTP status code. */
  readonly status: number;
  /** Machine-readable error type, e.g. "authentication_error". */
  readonly type?: string;
  /** Provider error code (may differ from HTTP status). */
  readonly code?: number | string;
  /** Raw parsed response body, if any. */
  readonly body?: unknown;
  /** Seconds to wait before retrying, from the `retry-after` header (429s). */
  readonly retryAfter?: number;

  constructor(
    message: string,
    opts: {
      status: number;
      type?: string;
      code?: number | string;
      body?: unknown;
      retryAfter?: number;
    }
  ) {
    super(message);
    this.name = "SnapEditError";
    this.status = opts.status;
    this.type = opts.type;
    this.code = opts.code;
    this.body = opts.body;
    this.retryAfter = opts.retryAfter;
  }

  /** True for 429 rate-limit responses. */
  get isRateLimit(): boolean {
    return this.status === 429;
  }

  /** True for 401/403 auth failures. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/** Thrown when an async task fails or a wait() call times out. */
export class SnapEditTaskError extends Error {
  readonly taskId: string;
  readonly status?: string;
  constructor(message: string, taskId: string, status?: string) {
    super(message);
    this.name = "SnapEditTaskError";
    this.taskId = taskId;
    this.status = status;
  }
}
