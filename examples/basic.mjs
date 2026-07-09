// Run: SNAPEDIT_API_KEY=sk-snap-... node examples/basic.mjs
import { SnapEdit, SnapEditError } from "@snapedit/sdk";

const client = new SnapEdit({ apiKey: process.env.SNAPEDIT_API_KEY });

try {
  // 1. Remove background from a URL
  const bg = await client.remove.background({
    input_image: "https://img.snapedit.app/portrait.jpg",
  });
  console.log("Background removed:", bg.data[0].url);

  // 2. Upscale 4×
  const up = await client.enhance.image({
    input_image: bg.data[0].url,
    zoom_factor: 4,
  });
  console.log("Upscaled:", up.data[0].url);

  // 3. Generate an image from text
  const gen = await client.generate.zimage({
    prompt: "a cozy reading nook, warm light, photorealistic",
    aspect_ratio: "3:2",
  });
  console.log("Generated:", gen.data[0].url);

  console.log("Rate limit:", client.rateLimit);
} catch (err) {
  if (err instanceof SnapEditError) {
    console.error(`API error ${err.status} (${err.type}):`, err.message);
  } else {
    throw err;
  }
}
