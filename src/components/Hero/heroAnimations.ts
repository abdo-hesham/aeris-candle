import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const motion = {
  floatDistance: 10,
  floatCycle: 4,
  forestScale: 1.05,
  forestDuration: 20,
  breezeRotation: 1.4,
  fogDuration: 18,
};

export function createAmbientAnimations(root: HTMLElement) {
  const select = gsap.utils.selector(root);
  const loop = { repeat: -1, yoyo: true, ease: "sine.inOut" };
  // Each ambient animation owns an inner wrapper; scroll owns the outer wrapper.
  const animations: gsap.core.Animation[] = [
    gsap.to(select(".forest-drift"), {
      scale: motion.forestScale,
      duration: motion.forestDuration,
      ...loop,
    }),
    gsap.to(select(".product-float"), {
      y: -motion.floatDistance,
      scale: 1.008,
      duration: motion.floatCycle / 2,
      ...loop,
    }),
    gsap.to(select(".product-shadow"), {
      scaleX: 0.9,
      opacity: 0.44,
      duration: motion.floatCycle / 2,
      ...loop,
    }),
    gsap.to(select(".product-glow"), {
      scale: 1.08,
      opacity: 0.24,
      duration: 3,
      ...loop,
    }),
    gsap.to(select(".leaf-breeze-left"), {
      rotation: motion.breezeRotation,
      x: 6,
      y: -4,
      duration: 6,
      ...loop,
    }),
    gsap.to(select(".leaf-breeze-right"), {
      rotation: -motion.breezeRotation,
      x: -5,
      y: 4,
      duration: 7,
      ...loop,
    }),
    gsap.fromTo(
      select(".fog-drift"),
      { xPercent: -4, opacity: 0.08 },
      { xPercent: 6, opacity: 0.17, duration: motion.fogDuration, ...loop },
    ),
  ];
  select(".particle").forEach((particle: HTMLElement, i: number) => {
    const cycle = gsap.timeline({ repeat: -1, delay: (i % 5) * 0.7 });
    cycle
      .fromTo(
        particle,
        { y: 20, x: 0, opacity: 0 },
        {
          y: -55 - (i % 4) * 14,
          x: (i % 2 ? 1 : -1) * 22,
          duration: 10 + (i % 6),
          ease: "none",
        },
        0,
      )
      .to(particle, { opacity: 0.5, duration: 3 }, 0)
      .to(particle, { opacity: 0, duration: 3 }, 7 + (i % 6));
    animations.push(cycle);
  });
  return animations;
}

/** One-second normalized scaffold. It changes no DOM properties yet. */
export function createStoryTimeline(root: HTMLElement) {
  const scrollState = { progress: 0 };
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  timeline
    .to(scrollState, { progress: 1, duration: 1 }, 0)
    .addLabel("environment-deepens", 0)
    .addLabel("branches-enter", 0.2)
    .addLabel("center-softens", 0.4)
    .addLabel("candle-transitions", 0.6)
    .addLabel("product-story", 1);
  return {
    timeline,
    targets: {
      environment: root.querySelector<HTMLElement>(
        '[data-layer="environment"]',
      ),
      leftBranch: root.querySelector<HTMLElement>(
        '[data-layer="branches-left"]',
      ),
      rightBranch: root.querySelector<HTMLElement>(
        '[data-layer="branches-right"]',
      ),
      atmosphere: root.querySelector<HTMLElement>('[data-layer="atmosphere"]'),
      product: root.querySelector<HTMLElement>('[data-layer="product"]'),
      typography: root.querySelector<HTMLElement>('[data-layer="typography"]'),
    },
    setProgress: (progress: number) =>
      timeline.progress(gsap.utils.clamp(0, 1, progress)),
  };
}

/** Opt-in only: call after adding the next section and actual story tweens. */
export function attachStoryScroll(
  root: HTMLElement,
  timeline: gsap.core.Timeline,
) {
  return ScrollTrigger.create({
    trigger: root,
    start: "top top",
    end: "+=1800",
    animation: timeline,
    scrub: 1,
    pin: true,
    invalidateOnRefresh: true,
  });
}
