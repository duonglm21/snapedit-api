// Async virtual try-on with automatic polling.
// Run: SNAPEDIT_API_KEY=sk-snap-... node examples/try-on.mjs
import { SnapEdit } from "@snapedit/sdk";

const client = new SnapEdit({ apiKey: process.env.SNAPEDIT_API_KEY });

const task = await client.tryOn.run(
  {
    model_image: "https://example.com/person.jpg",
    cloth_image: "https://example.com/shirt.jpg",
    cloth_type: "upper",
    hd_mode: false,
  },
  {
    pollInterval: 3000,
    onProgress: (t) => console.log(`  ${t.status} ${t.progress ?? 0}%`),
  }
);

console.log("Done:", task.download_url);
