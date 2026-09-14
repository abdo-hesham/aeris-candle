/**
 * Bakes the preloader's backdrop.
 *
 * The plate is never shown in focus: it carries `blur(54px)` so it reads as
 * room light rather than as a picture. Doing that at runtime means the browser
 * blurs a full-viewport image on the first frame it paints — which is the one
 * frame that matters, because the plate is the first thing the reader sees.
 * Measured on a throttled phone it cost about 0.7s of that first paint.
 *
 * So the blur is baked in and the image is stored at the size a blur that
 * heavy can actually carry. The CSS then draws a small picture at its natural
 * softness, with no filter at all.
 *
 * Run: node scripts/bake-preloader-plate.mjs
 */
import sharp from "sharp";

const WIDTH = 320;
/** 54px of blur across a ~900px fold, expressed against this width. */
const SIGMA = 18;

const output = "public/assets/preloader-plate.webp";
await sharp("public/assets/preloader.webp")
  .resize({ width: WIDTH })
  .blur(SIGMA)
  .modulate({ brightness: 0.92, saturation: 1.06 })
  .webp({ quality: 82, effort: 6 })
  .toFile(output);
const { size } = await sharp(output).metadata();
console.log(`${output}: ${Math.round(size / 1024)} KB`);
