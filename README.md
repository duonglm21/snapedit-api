# SnapEdit SDK

[![npm version](https://img.shields.io/npm/v/@snapedit/sdk.svg)](https://www.npmjs.com/package/@snapedit/sdk)
[![license](https://img.shields.io/npm/l/@snapedit/sdk.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/@snapedit/sdk.svg)](https://www.npmjs.com/package/@snapedit/sdk)

Official TypeScript / JavaScript SDK for the [SnapEdit API](https://developer.snapedit.app) — **40+ AI image & video editing models through a single API key**: background removal, object/text/logo erasing, upscaling, restoration, image generation, virtual try-on, video enhancement, and more.

- ✅ Full TypeScript types for every endpoint
- ✅ Works in Node.js 18+, Bun, Deno, edge runtimes, and the browser
- ✅ Accepts URLs, local file paths, `Blob`, `Buffer`, and `Uint8Array` inputs
- ✅ Built-in retries, timeouts, and rate-limit tracking
- ✅ One-call helpers for async tasks (`try-on`, video, PDF) with automatic polling

## Installation

```bash
npm install @snapedit/sdk
# or: pnpm add @snapedit/sdk / yarn add @snapedit/sdk / bun add @snapedit/sdk
```

## Quick start

Get an API key from the [SnapEdit dashboard](https://developer.snapedit.app/en/dashboard/api-keys) (keys start with `sk-snap-`).

```ts
import { SnapEdit } from "@snapedit/sdk";

const client = new SnapEdit({ apiKey: process.env.SNAPEDIT_API_KEY! });

// Remove the background from an image URL
const result = await client.remove.background({
  input_image: "https://img.snapedit.app/portrait.jpg",
});

console.log(result.data[0].url); // → https://outputs.snapedit.app/...
```

CommonJS works too:

```js
const { SnapEdit } = require("@snapedit/sdk");
```

## Inputs: URL, path, or binary

Every `input_image` (and other file fields) accepts:

| Input             | Example                                             |
| ----------------- | --------------------------------------------------- |
| Remote URL        | `"https://example.com/cat.jpg"`                     |
| Local file path\* | `"./photos/cat.jpg"`                                |
| `Blob` / `File`   | `new Blob([bytes])` / a browser `File`              |
| `Buffer`          | `fs.readFileSync("./cat.jpg")`                      |
| `Uint8Array`      | `new Uint8Array(bytes)`                             |

\* Local file paths are read from disk in Node.js only.

## Configuration

```ts
const client = new SnapEdit({
  apiKey: "sk-snap-...",         // required
  baseURL: "https://api.snapedit.app/v1", // optional override
  authScheme: "bearer",          // "bearer" (default) or "api-key" header
  timeout: 60_000,               // per-request timeout in ms
  maxRetries: 2,                 // retries on 429 / 5xx / network errors
  defaultHeaders: {},            // extra headers on every request
});
```

## Examples by category

### Removal

```ts
await client.remove.background({ input_image: url });            // remove bg
await client.remove.background({ input_image: url, output_type: "mask" });
await client.remove.objects({ input_image: url, erase_mode: "super" });
await client.remove.text({ input_image: url, input_mask: maskUrl });
await client.remove.logo({ input_image: url });                 // auto-detects logo
await client.remove.reflection({ input_image: url });
```

### Detection (then erase what you found)

```ts
const det = await client.detect.objects({ input_image: url, lang: "vi" });
const removed = await client.remove.objects({
  input_image: url,
  original_session_id: det.session_id,
  mask_objects: det.detected_objects.map((o) => o.object_type).join(","),
});
```

### Enhance / restore / colorize

```ts
await client.enhance.image({ input_image: url, zoom_factor: 4 });     // 4× upscale
await client.enhance.imagePro({ input_image: url, zoom_factor: 2 });  // higher quality
await client.enhance.restore({ input_image: oldPhotoUrl });          // fix old photos
await client.enhance.colorize({ input_image: bwPhotoUrl });          // add color
```

### Generation

```ts
await client.generate.zimage({ prompt: "a fox in a snowy forest", aspect_ratio: "16:9" });
await client.generate.qwen({ prompt: "product photo of a coffee mug" });
await client.generate.headshot({ input_image: selfieUrl, prompt: "corporate suit, studio light" });
```

### AI prompt editing

```ts
await client.edit.edit({
  input_image: url,
  prompt: "make it a sunset scene",
  mode: "editing",
});

await client.edit.edit({
  input_image: url,
  input_mask: maskUrl,
  prompt: "replace with a red car",
  mode: "inpaint",
});
```

### Beauty & style

```ts
await client.beauty.retouchSkin({ input_image: portraitUrl });
await client.beauty.makeup({ input_image: portraitUrl, style: "natural_01" });
await client.beauty.hairstyle({ input_image: portraitUrl, style: "bob_02" });
```

### Async tasks (virtual try-on, video, PDF)

Async endpoints return a `task_id`. Use the `.run()` helper to create **and** poll to completion in one call:

```ts
const task = await client.tryOn.run(
  {
    model_image: personUrl,
    cloth_image: shirtUrl,
    cloth_type: "upper",
    hd_mode: true,
  },
  { onProgress: (t) => console.log(t.status, t.progress) }
);

console.log(task.download_url);
```

Or drive the task manually:

```ts
const { task_id } = await client.tryOn.create({ /* ... */ });
const status = await client.tryOn.get(task_id);
// await client.tryOn.cancel(task_id);
```

Video and PDF work the same way (upload + poll handled for you):

```ts
const video = await client.video.enhance("./clip.mp4", { zoom_factor: "2K" });
const pdf = await client.files.removeLogoPdf("./document.pdf");
```

## Error handling

All non-2xx responses throw a `SnapEditError`; async task failures throw a `SnapEditTaskError`.

```ts
import { SnapEditError } from "@snapedit/sdk";

try {
  await client.remove.background({ input_image: url });
} catch (err) {
  if (err instanceof SnapEditError) {
    console.error(err.status, err.type, err.message);
    if (err.isRateLimit) console.log(`retry after ${err.retryAfter}s`);
  }
}
```

## Rate limits

Default limit is **60 requests/minute** per API key. After any call you can inspect the latest limits:

```ts
console.log(client.rateLimit);
// { limit: 60, remaining: 58, reset: "2026-04-28T10:00:00Z" }
```

The client automatically retries `429` and `5xx` responses (respecting `retry-after`) up to `maxRetries`.

## OpenAI SDK compatibility

The API is also compatible with the OpenAI SDK for generation/editing operations — point `baseURL` at SnapEdit:

```ts
import OpenAI from "openai";
const client = new OpenAI({ apiKey: "sk-snap-...", baseURL: "https://api.snapedit.app/v1" });
```

## API coverage

| Resource          | Methods |
| ----------------- | ------- |
| `client.detect`   | `objects`, `text`, `wires` |
| `client.remove`   | `objects`, `text`, `logo`, `wires`, `background`, `backgroundGraphic`, `reflection`, `mirror` |
| `client.enhance`  | `image`, `imagePro`, `art`, `restore`, `restorePro`, `colorize`, `colorizePro`, `lightRestore`, `backlitFix`, `nightFlash` |
| `client.generate` | `zimage`, `qwen`, `art`, `background`, `headshot`, `sticker` |
| `client.edit`     | `edit`, `multi` |
| `client.beauty`   | `retouchSkin`, `makeup`, `hairstyle` |
| `client.utility`  | `outpaint`, `poseSuggest`, `aiDetect` |
| `client.tryOn`    | `create`, `get`, `cancel`, `wait`, `run` |
| `client.video`    | `enhance`, `removeLogo`, `getEnhanceStatus`, `getRemoveLogoStatus` |
| `client.files`    | `removeLogoPdf`, `getRemoveLogoPdfStatus` |
| `client.health()` | Unauthenticated health check |

## Documentation

- 📖 [Full API reference](https://developer.snapedit.app/en/docs)
- 🔑 [Get an API key](https://developer.snapedit.app/en/dashboard/api-keys)
- 🧪 [API playground](https://developer.snapedit.app/en/docs/playground)

## License

[MIT](./LICENSE) © SnapEdit
