import { HttpClient } from "./http.js";
import { SnapEditTaskError } from "./error.js";
import type {
  AiDetectResult,
  AspectRatio,
  DetectionResult,
  EraseMode,
  FileInput,
  ImageResult,
  Lang,
  RequestOptions,
  TaskResult,
  UploadTaskResult,
  WaitOptions,
} from "./types.js";

/** Detection: locate objects, text, or wires in an image. */
export class DetectResource {
  constructor(private http: HttpClient) {}

  objects(
    params: { input_image: FileInput; lang?: Lang },
    opts?: RequestOptions
  ): Promise<DetectionResult> {
    return this.http.postForm("/images/detect-objects", params, opts);
  }

  text(
    params: { input_image: FileInput },
    opts?: RequestOptions
  ): Promise<DetectionResult> {
    return this.http.postForm("/images/detect-text", params, opts);
  }

  wires(
    params: { input_image: FileInput },
    opts?: RequestOptions
  ): Promise<DetectionResult> {
    return this.http.postForm("/images/detect-wires", params, opts);
  }
}

/** Removal: erase objects, text, logos, wires, or the background. */
export class RemoveResource {
  constructor(private http: HttpClient) {}

  objects(
    params: {
      input_image: FileInput;
      original_session_id?: string;
      input_mask?: FileInput;
      mask_objects?: string;
      erase_mode?: EraseMode;
    },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-objects", params, opts);
  }

  text(
    params: { input_image: FileInput; input_mask: FileInput; erase_mode?: EraseMode },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-text", params, opts);
  }

  logo(
    params: { input_image: FileInput; input_mask?: FileInput; erase_mode?: "lite" | "default" },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-logo", params, opts);
  }

  wires(
    params: { input_image: FileInput; input_mask: FileInput },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-wires", params, opts);
  }

  background(
    params: { input_image: FileInput; output_type?: "foreground" | "mask" },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-background", params, opts);
  }

  backgroundGraphic(
    params: { input_image: FileInput; output_type?: "foreground" | "mask" },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-background-graphic", params, opts);
  }

  reflection(
    params: { input_image: FileInput },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/remove-reflection", params, opts);
  }

  mirror(
    params: { input_image: FileInput },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/clean-mirror", params, opts);
  }
}

/** Enhance, restore, colorize, and repair images. */
export class EnhanceResource {
  constructor(private http: HttpClient) {}

  image(
    params: { input_image: FileInput; zoom_factor: 2 | 4; enhance_faces?: boolean },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/enhance", params, opts);
  }

  imagePro(
    params: { input_image: FileInput; zoom_factor: 2 | 4; enhance_faces?: boolean },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/enhance/pro", params, opts);
  }

  art(
    params: { input_image: FileInput; zoom_factor: 2 | 4 },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/enhance-art", params, opts);
  }

  restore(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/restore", params, opts);
  }

  restorePro(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/restore/pro", params, opts);
  }

  colorize(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/colorize", params, opts);
  }

  colorizePro(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/colorize/pro", params, opts);
  }

  lightRestore(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/light-restore", params, opts);
  }

  backlitFix(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/backlit-fix", params, opts);
  }

  nightFlash(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/night-flash", params, opts);
  }
}

/** Text-to-image and image-to-image generation. */
export class GenerateResource {
  constructor(private http: HttpClient) {}

  zimage(
    params: { prompt: string; aspect_ratio?: AspectRatio },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/generates/zimage", params, opts);
  }

  qwen(
    params: { prompt: string; aspect_ratio?: AspectRatio },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/generates/qwen", params, opts);
  }

  art(
    params: { input_image: FileInput; style: string },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/generates/art", params, opts);
  }

  background(
    params: { input_image: FileInput; prompt: string },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/generates-background", params, opts);
  }

  headshot(
    params: { input_image: FileInput; prompt: string },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/generates/headshot", params, opts);
  }

  sticker(
    params: { input_image: FileInput; prompt: string },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/generates/sticker", params, opts);
  }
}

/** AI prompt-based editing (single and multi-image). */
export class EditResource {
  constructor(private http: HttpClient) {}

  edit(
    params: {
      input_image: FileInput;
      prompt: string;
      mode: "editing" | "inpaint";
      input_mask?: FileInput;
    },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/edits", params, opts);
  }

  multi(
    params: {
      input_image_0: FileInput;
      prompt: string;
      mode: "editing";
      input_image_1?: FileInput;
      input_image_2?: FileInput;
    },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/edits/multi", params, opts);
  }
}

/** Beauty & style: skin, makeup, hairstyle. */
export class BeautyResource {
  constructor(private http: HttpClient) {}

  retouchSkin(params: { input_image: FileInput }, opts?: RequestOptions): Promise<ImageResult> {
    return this.http.postForm("/images/retouch-skin", params, opts);
  }

  makeup(
    params: { input_image: FileInput; style: string },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/transfer-makeup", params, opts);
  }

  hairstyle(
    params: { input_image: FileInput; style: string },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/hairstyle", params, opts);
  }
}

/** Miscellaneous utilities: outpaint, pose suggestions, AI-image detection. */
export class UtilityResource {
  constructor(private http: HttpClient) {}

  outpaint(
    params: { input_image: FileInput; input_mask: FileInput },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/outpaint", params, opts);
  }

  poseSuggest(
    params: { input_image: FileInput; num_models: number; gender: "female" | "male" },
    opts?: RequestOptions
  ): Promise<ImageResult> {
    return this.http.postForm("/images/pose-suggest", params, opts);
  }

  aiDetect(
    params: { input_image: FileInput },
    opts?: RequestOptions
  ): Promise<AiDetectResult> {
    return this.http.postForm("/images/ai-detect", params, opts);
  }
}

/** Shared polling helper for async task-based endpoints. */
async function waitForTask(
  http: HttpClient,
  statusPath: (id: string) => string,
  taskId: string,
  opts?: WaitOptions
): Promise<TaskResult> {
  const pollInterval = opts?.pollInterval ?? 3000;
  const maxWait = opts?.maxWait ?? 300_000;
  const deadline = Date.now() + maxWait;

  while (true) {
    const task = await http.get<TaskResult>(statusPath(taskId), opts);
    opts?.onProgress?.(task);

    if (task.status === "COMPLETED") return task;
    if (task.status === "FAILED" || task.status === "CANCELLED") {
      throw new SnapEditTaskError(
        task.error_msg || `Task ${task.status.toLowerCase()}`,
        taskId,
        task.status
      );
    }
    if (Date.now() > deadline) {
      throw new SnapEditTaskError("Timed out waiting for task", taskId, task.status);
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }
}

/** Virtual try-on (async). */
export class TryOnResource {
  constructor(private http: HttpClient) {}

  create(
    params: {
      model_image: FileInput;
      cloth_image: FileInput;
      cloth_type: "upper" | "lower" | "full";
      lower_cloth_image?: FileInput;
      hd_mode?: boolean;
    },
    opts?: RequestOptions
  ): Promise<TaskResult> {
    return this.http.postForm("/images/try-on", params, opts);
  }

  get(taskId: string, opts?: RequestOptions): Promise<TaskResult> {
    return this.http.get(`/images/try-on/tasks/${taskId}`, opts);
  }

  cancel(taskId: string, opts?: RequestOptions): Promise<TaskResult> {
    return this.http.delete(`/images/try-on/tasks/${taskId}`, opts);
  }

  /** Poll until the task completes (or fails/times out). */
  wait(taskId: string, opts?: WaitOptions): Promise<TaskResult> {
    return waitForTask(this.http, (id) => `/images/try-on/tasks/${id}`, taskId, opts);
  }

  /** Create then wait, returning the finished task in one call. */
  async run(
    params: Parameters<TryOnResource["create"]>[0],
    opts?: WaitOptions
  ): Promise<TaskResult> {
    const { task_id } = await this.create(params, opts);
    return this.wait(task_id, opts);
  }
}

/** PUT binary data to a signed upload URL (used by video/pdf endpoints). */
async function putToUploadUrl(
  http: HttpClient,
  uploadUrl: string,
  file: FileInput
): Promise<void> {
  let body: BodyInit;
  if (typeof file === "string") {
    if (/^https?:\/\//i.test(file)) {
      body = await (await fetch(file)).blob();
    } else {
      const { readFile } = await import("node:fs/promises");
      body = new Blob([new Uint8Array(await readFile(file))]);
    }
  } else if (file instanceof Blob) {
    body = file;
  } else if (file instanceof ArrayBuffer) {
    body = new Blob([new Uint8Array(file)]);
  } else {
    body = new Blob([Uint8Array.from(file as Uint8Array)]);
  }
  const res = await fetch(uploadUrl, { method: "PUT", body });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}) to signed URL`);
  }
}

/** Video enhancement and logo removal (async, upload-based). */
export class VideoResource {
  constructor(private http: HttpClient) {}

  /** Reserve an upload slot, PUT the file, and return the task_id. */
  private async uploadFor(uploadPath: string, file: FileInput): Promise<string> {
    const { task_id, upload_url } = await this.http.postForm<UploadTaskResult>(
      uploadPath,
      {}
    );
    await putToUploadUrl(this.http, upload_url, file);
    return task_id;
  }

  async enhance(
    file: FileInput,
    params: { zoom_factor?: "FHD" | "2K" } = {},
    opts?: WaitOptions
  ): Promise<TaskResult> {
    const task_id = await this.uploadFor("/videos/enhance/upload", file);
    await this.http.postForm("/videos/enhance", { task_id, zoom_factor: params.zoom_factor ?? "FHD" }, opts);
    return waitForTask(this.http, (id) => `/videos/enhance/tasks/${id}`, task_id, opts);
  }

  async removeLogo(file: FileInput, opts?: WaitOptions): Promise<TaskResult> {
    const task_id = await this.uploadFor("/videos/remove-logo/upload", file);
    await this.http.postForm("/videos/remove-logo", { task_id }, opts);
    return waitForTask(this.http, (id) => `/videos/remove-logo/tasks/${id}`, task_id, opts);
  }

  getEnhanceStatus(taskId: string, opts?: RequestOptions): Promise<TaskResult> {
    return this.http.get(`/videos/enhance/tasks/${taskId}`, opts);
  }

  getRemoveLogoStatus(taskId: string, opts?: RequestOptions): Promise<TaskResult> {
    return this.http.get(`/videos/remove-logo/tasks/${taskId}`, opts);
  }
}

/** File operations (async): remove logo from PDF. */
export class FilesResource {
  constructor(private http: HttpClient) {}

  async removeLogoPdf(file: FileInput, opts?: WaitOptions): Promise<TaskResult> {
    const { task_id, upload_url } = await this.http.postForm<UploadTaskResult>(
      "/files/remove-logo-pdf/upload",
      {}
    );
    await putToUploadUrl(this.http, upload_url, file);
    await this.http.postForm("/files/remove-logo-pdf", { task_id }, opts);
    return waitForTask(this.http, (id) => `/files/remove-logo-pdf/tasks/${id}`, task_id, opts);
  }

  getRemoveLogoPdfStatus(taskId: string, opts?: RequestOptions): Promise<TaskResult> {
    return this.http.get(`/files/remove-logo-pdf/tasks/${taskId}`, opts);
  }
}
