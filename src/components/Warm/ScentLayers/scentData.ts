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
    image: "/section-3/section3-sandalwood.png",
    alt: "Split sandalwood billets resting on travertine with fine shavings",
  },
  {
    key: "amber",
    index: "02",
    name: "Amber",
    feeling: "The warmth",
    description: "A golden depth that lingers softly in the room.",
    image: "/section-3/section3-amber.png",
    alt: "Raw amber resin catching low golden light",
  },
  {
    key: "cedar",
    index: "03",
    name: "Cedar",
    feeling: "The stillness",
    description: "Dry woods and a calm, structured finish.",
    image: "/section-3/section3-cedar.png",
    alt: "Dry cedar wood and a sprig of cedar foliage",
  },
];

export const scentLayers = {
  background: "/section-3/section3-background.png",
  disc: "/section-3/section3-stone-disc.png",
  shadow: "/section-3/section3-shadow-overlay.png",
  platform: "/section-3/section3-stone-platform.png",
  bowl: "/section-3/section3-stone-bowl.png",
  branch: "/section-3/section3-dried-branch.png",
};
