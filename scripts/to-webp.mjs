/**
 * Re-encodes the room plates as WebP at their own dimensions.
 *
 * Every layer of this site was a 24-bit PNG between 0.8 and 2.7 MB. The reader
 * never saw those bytes — `next/image` re-encodes each one — but somebody had
 * to pay for the re-encoding, and on a cold cache that somebody is the first
 * visitor: thirty transforms, each one decoding a multi-megabyte PNG, queued
 * behind each other. That is the wait, and it is why the second visit is fast.
 *
 * WebP at q90 is visually the same picture at a tenth of the bytes, so the
 * transform is quick and the first visit stops paying for the format.
 *
 * Run: node scripts/to-webp.mjs
 */
import sharp from "sharp";
import { readdir, rename, stat, unlink } from "node:fs/promises";

const dirs = ["public/assets", "public/section-3", "public/section-4"];
/** Small enough that the re-encode would only cost quality. */
const FLOOR = 400 * 1024;

let before = 0;
let after = 0;
for (const dir of dirs) {
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".png")) continue;
    const source = `${dir}/${file}`;
    const size = (await stat(source)).size;
    if (size < FLOOR) continue;
    const target = source.replace(/\.png$/, ".webp");
    await sharp(source).webp({ quality: 90, effort: 6 }).toFile(target);
    const written = (await stat(target)).size;
    before += size;
    after += written;
    console.log(
      `${source}: ${(size / 1024).toFixed(0)}KB -> ${(written / 1024).toFixed(0)}KB`,
    );
    await unlink(source);
  }
}
console.log(
  `total ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`,
);
