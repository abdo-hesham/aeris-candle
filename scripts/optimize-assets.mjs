import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

// Format/size optimization only. Preserve the generated transparent alpha.
// The plates that were larger than 400KB are WebP now — scripts/to-webp.mjs
// owns those — so what is left here is the handful of small PNGs that still
// carry an alpha channel this script has to check.
const sizes = {
  "candle-product": 800,
  "foreground-left-leaves": 900,
  "foreground-right-leaves": 900,
  "fog-overlay": 1280,
  particles: 64,
};
for (const [name, width] of Object.entries(sizes)) {
  const path = new URL(`../public/assets/${name}.png`, import.meta.url);
  const source = await readFile(path);
  const output = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 95, effort: 9 })
    .toBuffer();
  await writeFile(path, output);
  const metadata = await sharp(output).metadata();
  console.log(
    `${name}: ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}, ${Math.round(output.length / 1024)} KB`,
  );
  {
    const { data, info } = await sharp(output)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let clear = 0;
    for (let i = 3; i < data.length; i += info.channels)
      if (data[i] === 0) clear++;
    if (!clear) throw new Error(`${name}: no transparent pixels`);
    console.log(
      `  transparent pixels: ${((clear / (info.width * info.height)) * 100).toFixed(1)}%`,
    );
  }
}
