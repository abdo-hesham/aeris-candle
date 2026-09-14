export type ScentKey = "sandalwood" | "amber" | "cedar";

export type Scent = {
  key: ScentKey;
  index: string;
  name: string;
  feeling: string;
  description: string;
  image: string;
  alt: string;
};

export const scents: Scent[] = [
  {
    key: "sandalwood",
    index: "01",
    name: "Sandalwood",
    feeling: "The softness",
    description:
      "Soft, creamy woods. A familiar warmth that settles gently into the room.",
    image: "/section-3/section3-sandalwood.webp",
    alt: "Split sandalwood billets resting on travertine with fine shavings",
  },
  {
    key: "amber",
    index: "02",
    name: "Amber",
    feeling: "The warmth",
    description: "A golden depth that lingers softly in the room.",
    image: "/section-3/section3-amber.webp",
    alt: "Raw amber resin catching low golden light",
  },
  {
    key: "cedar",
    index: "03",
    name: "Cedar",
    feeling: "The stillness",
    description: "Dry woods and a calm, structured finish.",
    image: "/section-3/section3-cedar.webp",
    alt: "Dry cedar wood and a sprig of cedar foliage",
  },
];

export const scentLayers = {
  background: "/section-3/section3-background.webp",
  disc: "/section-3/section3-stone-disc.webp",
  shadow: "/section-3/section3-shadow-overlay.webp",
  platform: "/section-3/section3-stone-platform.webp",
  bowl: "/section-3/section3-stone-bowl.webp",
  branch: "/section-3/section3-dried-branch.webp",
};
