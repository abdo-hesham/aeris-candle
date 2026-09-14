import { product } from "@/data/product";

// Section 4 — "Made for slower evenings." Every layer of the closing still
// life stays a separate asset, so the scroll story can move them apart and
// bring them back together.
export const ritualLayers = {
  background: "/section-4/section4-background.webp",
  light: "/section-4/section4-light-overlay.webp",
  platform: "/section-4/section4-platform.webp",
  sandalwood: "/section-4/section4-sandalwood.webp",
  amber: "/section-4/section4-amber.webp",
  cedar: "/section-4/section4-cedar.webp",
  candle: "/section-4/section4-candle.webp",
  linen: "/section-4/section4-linen.webp",
};

// Intrinsic sizes, read off the supplied files.
export const ritualSizes = {
  scene: { width: 1672, height: 941 },
  object: { width: 1448, height: 1086 },
  square: { width: 1254, height: 1254 },
};

// Both numbers come from the product record, so Section 2's "120 hours of
// warmth" and Section 4's spec panel cannot disagree.
export const ritualSpecs = [
  { value: product.netWeight.toUpperCase(), label: "Net weight" },
  { value: `${parseInt(product.burnTime, 10)} HRS`, label: "Burn time" },
];
