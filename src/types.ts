/**
 * Shared types for the SnapEdit API.
 * @see https://developer.snapedit.app/llms-full.txt
 */

/** Anything that can be sent as an image/file input. */
export type FileInput =
  | string // a URL (https://...) or a local file path (Node only)
  | Blob
  | Buffer
  | Uint8Array
  | ArrayBuffer;

export type AspectRatio =
  | "1:1"
  | "3:2"
  | "2:3"
  | "4:3"
  | "3:4"
  | "16:9"
  | "9:16";

export type EraseMode = "normal" | "super" | "ultra";
export type Lang = "en" | "es" | "id" | "jp" | "ms" | "pt" | "th" | "vi";

/** Standard image result envelope returned by most synchronous endpoints. */
export interface ImageResult {
  created: number;
  data: Array<{ url: string; b64_json?: string }>;
}

/** Result of the object-detection endpoint. */
export interface DetectionResult {
  session_id: string;
  detected_objects: Array<{
    box: [number, number, number, number];
    mask: string;
    accuracy: number;
    object_type: string;
  }>;
}

export interface AiDetectResult {
  is_ai_image: boolean;
  score: number;
}

export type TaskStatus =
  | "CREATED"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/** Envelope returned by async task endpoints (try-on, video, pdf). */
export interface TaskResult {
  task_id: string;
  status: TaskStatus;
  progress?: number;
  download_url?: string | null;
  error_msg?: string | null;
  created_at?: number;
  started_at?: number;
  completed_at?: number;
}

export interface UploadTaskResult {
  task_id: string;
  upload_url: string;
}

export interface RateLimit {
  limit: number | null;
  remaining: number | null;
  reset: string | null;
}

/** Options accepted by every request. */
export interface RequestOptions {
  /** Abort the request. */
  signal?: AbortSignal;
  /** Override the client-level timeout (ms) for this call. */
  timeout?: number;
}

export interface WaitOptions extends RequestOptions {
  /** How often to poll the task status, in ms. Default: 3000. */
  pollInterval?: number;
  /** Give up after this many ms. Default: 300000 (5 min). */
  maxWait?: number;
  /** Called with each status update while polling. */
  onProgress?: (task: TaskResult) => void;
}
