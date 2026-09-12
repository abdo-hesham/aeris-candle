import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export { gsap, ScrollTrigger };

// The story is one pin with one scrubbed timeline, and `onUpdate` runs on it
// every frame. `limitCallbacks` stops ScrollTrigger firing the enter/leave
// callbacks more than once per scroll direction, and `ignoreMobileResize`
// stops a phone's address bar sliding away from counting as a resize — each
// of which otherwise forces a full re-measure of a pinned document.
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
export const motion = {
  // Desktop: one pin holds the whole story — every chapter, every handoff.
  storyLength: 14,
  // Phones are not pinned past the hero, so only the hero chapter scrolls here.
  mobileScrollLength: 2.6,
  backgroundScale: 1.045,
  candleScale: 0.78,
  pointInterval: 0.7,
  pointRevealDuration: 0.25,
  headingTravel: -48,
  smoothDuration: 0.8,
  // Where the candle comes to rest during the handoff: the spot the sandalwood
  // takes over. `.scent-stage` is 16/10 and anchored to the bottom of the
  // viewport, so both numbers are read off the stage rather than the hero.
  // That keeps candle and wood on the same patch of stone at every size.
  handoffCandleX: 0.2,
  stageAspect: 0.625,
  handoffCandleBase: 0.191,
};

// Timeline units. The hero chapter keeps the units it was authored in; the
// handoff and the scent story are appended after it. One timeline and one pin
// own every layer, so no two triggers can touch the same element.
// Seven consecutive, non-overlapping segments of one scrubbed timeline:
// hero chapter, hero -> product handoff, product portrait, product -> scent
// handoff, scent story, scent -> ritual handoff, ritual close. A segment owns
// every property it touches for its whole span, and no two segments touch the
// same property at the same scroll position.
const CHAPTER_UNITS = 4.45;
const HANDOFF_UNITS = 3.0;
// Phones run no handoff at all. The handoff exists to dissolve one pinned
// room into the next, and on a phone there is no next room inside the pin:
// the scent chapter is a separate block below. Running it anyway emptied the
// screen — the portrait faded out, the room washed to ivory, and the reader
// held a blank ivory frame with nothing on it but the candle. The phone
// chapter now ends on its own portrait and simply scrolls away.
const SCENT_UNITS = 3.4;
// Section 3 -> Section 4: the three notes come back together as one object,
// in the unlit reference composition. The longest segment on the page: the
// two rooms cross over a third of it, and an exposure change that large needs
// the scroll distance to read as a dissolve rather than a cut. The copy
// belongs to the next segment.
const RITUAL_UNITS = 4.2;
// Section 4 itself: the words, the offer, and a hold on the finished room
// before the pin releases and the footer is allowed on screen.
const CLOSE_UNITS = 2.6;
const STORY_ID = "warm-story";

// Scent bands inside the scent segment. Each note holds still, then one
// dissolve carries the next in: sandalwood 0.00-0.20, change to 0.38, amber
// to 0.52, change to 0.70, cedar to 1.00. The label flips at the midpoint of
// its dissolve, so the row, the copy and the image are never out of step.
const CROSSFADES: [number, number][] = [
  [0.2, 0.38],
  [0.52, 0.7],
];
const BOUNDARIES = CROSSFADES.map(([from, to]) => (from + to) / 2);
const CENTRES = [0.1, 0.45, 0.85];
const bandAt = (fraction: number) =>
  BOUNDARIES.filter((boundary) => fraction >= boundary).length;

export type WarmScene = {
  dispose: () => void;
  selectScent: (index: number) => void;
};

// The scroller is owned by the component, so the scene asks for a scroll
// instead of performing one. That keeps Lenis the single scroll authority.
export type WarmHooks = {
  autoScroll?: (top: number, duration: number) => void;
};

export function animateWarmScene(
  root: HTMLElement,
  onScent: (index: number) => void,
  hooks: WarmHooks = {},
): WarmScene {
  const select = gsap.utils.selector(root);
  const hero = root.querySelector<HTMLElement>(".warm-hero")!;
  const story = root.querySelector<HTMLElement>("[data-story]")!;
  const scents = root.querySelector<HTMLElement>(".scent-layers")!;
  const mobile = window.innerWidth < 768;
  const candle = root.querySelector<HTMLElement>(".warm-product-layer")!;
  // Desktop stacks both chapters in one pinned viewport, so the candle can
  // dissolve into the scent scene instead of scrolling away from it.
  const stacked = !mobile;
  if (stacked) story.classList.add("warm-chapters--stacked");

  // The hero entrance lives in `intro.ts` and runs once, after the preloader
  // leaves. Scroll owns the parents from there on, so a fast scroll cannot
  // fight the entrance or make hidden copy reappear.

  const scene = stacked ? scentScene(scents) : null;
  // Every scent layer is hidden before any trigger exists, so nothing can
  // flash into view while the reader is still inside the hero chapter.
  if (scene) hideScentScene(scene);

  const closing = root.querySelector<HTMLElement>(".ritual");
  const ritual = closing ? ritualScene(closing) : null;
  // Same rule for the closing room: hidden by `set`, never by a `from`, so no
  // Section 4 layer can paint a frame before the handoff asks for it.
  if (ritual) hideRitualScene(ritual);

  const units = stacked
    ? CHAPTER_UNITS + HANDOFF_UNITS + SCENT_UNITS + RITUAL_UNITS + CLOSE_UNITS
    : CHAPTER_UNITS;
  let scrubbed: gsap.core.Timeline | undefined;

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    onUpdate: () => {
      if (!stacked || !scrubbed) return;
      const fraction =
        (scrubbed.progress() * units - CHAPTER_UNITS - HANDOFF_UNITS) /
        SCENT_UNITS;
      onScent(fraction > 0 ? bandAt(fraction) : 0);
    },
    scrollTrigger: {
      id: STORY_ID,
      trigger: stacked ? story : hero,
      start: "top top",
      end: () =>
        `+=${hero.clientHeight * (stacked ? motion.storyLength : motion.mobileScrollLength)}`,
      pin: true,
      // Cinematic lag: the scene keeps moving for a beat after the wheel
      // stops, which is what makes the room changes read as one move.
      scrub: mobile ? 0.18 : 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  scrubbed = timeline;
  // Locks the timeline to its authored length, so positions stay in units.
  timeline.set({}, {}, units);

  timeline
    .addLabel("arrival", 0)
    .addLabel("portrait", 0.35)
    .addLabel("details", 1.15)
    .to(select(".warm-scroll-cue"), { autoAlpha: 0, y: -6, duration: 0.22 }, 0)
    .to(
      select(".warm-background"),
      { scale: motion.backgroundScale, yPercent: -1, duration: 1.1 },
      0,
    )
    .to(
      select(".warm-heading"),
      {
        y: mobile ? -24 : motion.headingTravel,
        duration: 0.55,
        ease: "power2.inOut",
      },
      0,
    )
    .to(
      select(".warm-heading-letter"),
      {
        yPercent: -28,
        autoAlpha: 0,
        duration: 0.18,
        stagger: { each: 0.02, from: "start" },
        ease: "power2.in",
      },
      0,
    )
    .to(
      select(".warm-hero-eyebrow"),
      { y: mobile ? -24 : motion.headingTravel, autoAlpha: 0, duration: 0.55 },
      0,
    )
    .to(select(".warm-intro"), { y: -18, autoAlpha: 0, duration: 0.4 }, 0)
    .to(
      select(".warm-product-layer"),
      {
        scale: mobile ? 0.82 : motion.candleScale,
        x: () =>
          hero.clientWidth * 0.5 - candle.offsetLeft - candle.offsetWidth * 0.5,
        y: () =>
          hero.clientHeight * 0.56 -
          candle.offsetTop -
          candle.offsetHeight * 0.5,
        duration: 1.15,
        ease: "sine.inOut",
      },
      0,
    )
    .to(select(".warm-haze"), { xPercent: -12, yPercent: -15 }, 0)
    .to(
      select(".warm-fire-glow, .warm-haze"),
      { autoAlpha: 0, duration: 0.5 },
      0.25,
    )
    .to(
      select(".warm-product-details"),
      { autoAlpha: 1, duration: 1.07, ease: "sine.inOut" },
      "arrival+=0.08",
    )
    .to(
      select(".warm-contact-shadow"),
      { autoAlpha: 0, duration: 0.55 },
      "portrait",
    )
    .fromTo(
      select(".warm-product-details .warm-focus-light"),
      { scale: 0.72, opacity: 0 },
      { scale: 1, opacity: 0.65, duration: 0.8, ease: "power2.out" },
      "portrait",
    )
    .to(select(".warm-brand-lockup"), { color: "#eee1cb", duration: 0.5 }, 0.35)
    .fromTo(
      select(".warm-focus-heading, .warm-focus-caption"),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      0.7,
    )
    .fromTo(
      select(".warm-orbit-ring"),
      { scale: 0.96, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "sine.out" },
      0.75,
    );

  // Continuous progress reaches each SVG marker before revealing its label.
  const focus = gsap.utils.selector(
    root.querySelector(".warm-product-details")!,
  );
  gsap.set(focus(".warm-orbit-note"), { y: 12, autoAlpha: 0 });
  gsap.set(focus(".warm-orbit-progress"), { strokeDashoffset: 1 });
  gsap.set(focus(".warm-orbit-dot"), { autoAlpha: 0 });
  gsap.set(focus(".warm-orbit-head"), { autoAlpha: 0, svgOrigin: "50 50" });
  timeline.to(
    focus(".warm-orbit-head"),
    { autoAlpha: 1, duration: 0.12 },
    "details",
  );
  timeline.to(
    focus(".warm-orbit-head"),
    {
      rotation: 360,
      svgOrigin: "50 50",
      duration: motion.pointInterval * 4,
    },
    "details",
  );
  timeline.to(
    focus(".warm-focus-light"),
    { scale: 1.12, opacity: 0.9, duration: motion.pointInterval * 4 },
    "details",
  );
  timeline.to(
    focus(".warm-orbit-progress"),
    {
      strokeDashoffset: 0,
      // CSSPlugin otherwise rounds normalized SVG dash offsets to whole pixels.
      autoRound: false,
      duration: motion.pointInterval * 4,
      ease: "none",
    },
    "details",
  );
  const order = ["one", "two", "four", "three"];
  order.forEach((point, index) => {
    const reached = 1.15 + (index + 1) * motion.pointInterval;
    if (index > 0) {
      timeline.to(
        focus(`.warm-orbit-note--${order[index - 1]} > span`),
        {
          opacity: 0.78,
          duration: 0.18,
        },
        reached,
      );
    }
    // Fixed waypoints: only the travelling head moves around the ring.
    timeline.to(
      focus(`.warm-orbit-dot--${point}`),
      {
        autoAlpha: 1,
        duration: motion.pointRevealDuration,
      },
      reached,
    );
    timeline.to(
      focus(`.warm-orbit-note--${point}`),
      {
        y: 0,
        autoAlpha: 1,
        duration: motion.pointRevealDuration,
        ease: "power3.out",
      },
      reached,
    );
  });
  timeline.to(
    focus(".warm-orbit-note > span"),
    {
      opacity: 1,
      duration: 0.2,
    },
    4.05,
  );

  // Section 2 ends on an empty room, and there is nothing to aim at until
  // Section 3's first note is on the stone. When the reader stops inside
  // that gap, having arrived by scrolling down, the page carries them the
  // rest of the way and hands control straight back. It never fires on a
  // jump, never on the way up, and any wheel or touch cancels the glide
  // because Lenis owns the scroll.
  const glide = stacked && hooks.autoScroll ? armTheGlide(units, hooks) : null;

  if (stacked)
    openTheCandle(timeline, select, {
      scene,
      hero,
      candle,
      candleScale: motion.candleScale,
    });
  if (scene) tellTheScents(timeline, scene);
  // One timeline owns the whole Section 3 -> Section 4 handoff: the scent UI,
  // the scent stone, both backgrounds, the three notes, the candle, its
  // and the closing copy. No second trigger touches any of them.
  if (scene && ritual) {
    assembleTheRitual(timeline, scene, ritual);
    closeTheRitual(timeline, ritual);
  }

  if (!stacked) {
    animateScentEntrance(scents, onScent);
    if (ritual) animateRitualEntrance(ritual);
  }
  const releasePointer = stacked
    ? [
        pointerDepth(scents, ".scent-visual"),
        pointerDepth(closing, ".ritual-visual"),
      ]
    : [];

  return {
    selectScent: (index: number) => {
      // Phones have no pin to scroll into: the state itself is the switch.
      if (!stacked) {
        onScent(index);
        return;
      }
      const trigger = ScrollTrigger.getById(STORY_ID);
      if (!trigger) return;
      const at = CHAPTER_UNITS + HANDOFF_UNITS + CENTRES[index] * SCENT_UNITS;
      window.scrollTo({
        top: trigger.start + (at / units) * (trigger.end - trigger.start),
        behavior: "smooth",
      });
    },
    dispose: () => {
      glide?.();
      releasePointer.forEach((release) => release?.());
      story.classList.remove("warm-chapters--stacked");
    },
  };
}

// Fires once the reader has come to rest in the gap between the product
// portrait and the first scent note. Returns its own teardown.
function armTheGlide(units: number, hooks: WarmHooks) {
  const from = CHAPTER_UNITS + HANDOFF_UNITS * 0.2;
  const to = CHAPTER_UNITS + HANDOFF_UNITS + SCENT_UNITS * 0.06;
  const bounds = () => {
    const trigger = ScrollTrigger.getById(STORY_ID);
    if (!trigger) return null;
    const length = trigger.end - trigger.start;
    return {
      armY: trigger.start + (from / units) * length,
      targetY: trigger.start + (to / units) * length,
    };
  };

  let lastY = window.scrollY;
  // Only a run of ordinary downward steps counts as reading. One big jump —
  // a hash link, a restored position, a test — does not.
  let reading = false;
  let armed = true;
  let timer = 0;

  const settle = () => {
    const edges = bounds();
    if (!edges || !armed || !reading) return;
    const y = window.scrollY;
    if (y < edges.armY || y > edges.targetY - 80) return;
    armed = false;
    reading = false;
    hooks.autoScroll?.(edges.targetY, 1.9);
  };

  const onScroll = () => {
    const y = window.scrollY;
    const step = y - lastY;
    lastY = y;
    if (step >= 260 || step <= 0) reading = false;
    else if (step > 0) reading = true;
    const edges = bounds();
    if (edges && y < edges.armY - 120) armed = true;
    window.clearTimeout(timer);
    timer = window.setTimeout(settle, 180);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
  };
}

type ScentScene = ReturnType<typeof scentScene>;

function scentScene(section: HTMLElement) {
  const q = gsap.utils.selector(section);
  return {
    section,
    background: q(".scent-layer--background"),
    disc: q(".scent-layer--disc"),
    shadow: q(".scent-layer--shadow"),
    platform: q(".scent-layer--platform"),
    bowl: q(".scent-layer--bowl"),
    track: q(".scent-layer--ingredient"),
    branch: q(".scent-layer--branch"),
    ingredients: q<HTMLElement>("[data-scent-ingredient]"),
    warmTone: q('[data-scent-tone="warm"]'),
    groundedTone: q('[data-scent-tone="grounded"]'),
    headingLines: q("[data-scent-line]"),
    intro: q("[data-scent-intro]"),
    rows: q("[data-scent-row]"),
    meta: q("[data-scent-meta]"),
  };
}

function hideScentScene(scene: ScentScene) {
  gsap.set(
    [
      ...scene.disc,
      ...scene.platform,
      ...scene.bowl,
      ...scene.track,
      ...scene.branch,
      ...scene.intro,
      ...scene.rows,
      ...scene.meta,
    ],
    { autoAlpha: 0 },
  );
  gsap.set(scene.shadow, { opacity: 0 });
  gsap.set(scene.headingLines, { yPercent: 112 });
  gsap.set(scene.ingredients, { autoAlpha: 0 });
  gsap.set([...scene.warmTone, ...scene.groundedTone], { opacity: 0 });
}

// Section 2 -> Section 3, authored in fractions of the handoff segment. The
// product portrait sits above the scent room in the same pinned viewport, so
// the new room is reached by taking the old one away. The order is fixed:
// words leave, the halo opens, the room warms from brown to ivory, the stone
// arrives, the candle gives up its place, and only then does the sandalwood
// take it. The candle and the sandalwood never share the frame as equals.
function openTheCandle(
  timeline: gsap.core.Timeline,
  select: gsap.utils.SelectorFunc,
  {
    scene,
    hero,
    candle,
    candleScale,
  }: {
    scene: ScentScene | null;
    hero: HTMLElement;
    candle: HTMLElement;
    candleScale: number;
  },
) {
  const at = (fraction: number) => CHAPTER_UNITS + fraction * HANDOFF_UNITS;
  const span = (fraction: number) => fraction * HANDOFF_UNITS;

  // 1. The chapter's own words leave first; the object stays central.
  timeline
    .to(
      select(".warm-focus-heading, .warm-focus-caption, .warm-orbit-note"),
      { autoAlpha: 0, y: -14, duration: span(0.13), ease: "power1.in" },
      at(0),
    )
    .to(
      select(".warm-orbit-dot, .warm-orbit-progress, .warm-orbit-head"),
      { autoAlpha: 0, duration: span(0.12) },
      at(0.04),
    )
    .to(select(".warm-nav"), { autoAlpha: 0, duration: span(0.14) }, at(0.08))

    // 2. The halo opens outward — light, not a wipe.
    .to(
      select(".warm-orbit-ring"),
      {
        scale: 2.6,
        autoAlpha: 0,
        duration: span(0.34),
        ease: "power1.in",
      },
      at(0.1),
    );

  if (!scene) return;

  timeline
    // 3. The room opens up by exposure. Both washes are tints, never covers,
    //    and they overlap the portrait's own exit, so the brown chapter is
    //    lifted rather than blacked out and the reader can see the product
    //    through the whole change.
    .fromTo(
      select(".warm-wash--taupe"),
      { autoAlpha: 0 },
      { autoAlpha: 0.44, duration: span(0.2), ease: "sine.inOut" },
      at(0.06),
    )
    .fromTo(
      select(".warm-wash--sand"),
      { autoAlpha: 0 },
      { autoAlpha: 0.34, duration: span(0.22), ease: "sine.inOut" },
      at(0.16),
    )
    .to(
      select(".warm-background, .warm-product-details"),
      { autoAlpha: 0, duration: span(0.28), ease: "sine.inOut" },
      at(0.22),
    )
    .to(
      select(".warm-hero"),
      { backgroundColor: "rgba(44,26,17,0)", duration: span(0.28) },
      at(0.22),
    )
    .to(
      select(".warm-wash"),
      { autoAlpha: 0, duration: span(0.2), ease: "sine.inOut" },
      at(0.34),
    )
    .fromTo(
      scene.background,
      { scale: motion.backgroundScale },
      { scale: 1, duration: span(0.66) + SCENT_UNITS },
      at(0.34),
    )

    // 4. Stone architecture rises once the room is already ivory, so the
    //    reader reads one change at a time.
    .fromTo(
      scene.disc,
      { autoAlpha: 0, scale: 0.94, x: () => window.innerWidth * -0.08 },
      {
        autoAlpha: 1,
        scale: 1,
        x: 0,
        duration: span(0.22),
        ease: "power2.out",
      },
      at(0.3),
    )
    .fromTo(
      scene.platform,
      { autoAlpha: 0, y: 70 },
      { autoAlpha: 1, y: 0, duration: span(0.2), ease: "power2.out" },
      at(0.38),
    )
    .fromTo(
      scene.shadow,
      { opacity: 0 },
      { opacity: 0.18, duration: span(0.16), ease: "sine.inOut" },
      at(0.42),
    )

    // 5. The candle walks onto the platform, into the exact spot the
    //    sandalwood will hold, and grows a contact shadow again so it stands
    //    on the stone instead of hanging in the air.
    .to(
      select(".warm-product-layer"),
      {
        x: () =>
          hero.clientWidth * motion.handoffCandleX -
          candle.offsetLeft -
          candle.offsetWidth * 0.5,
        y: () => {
          const stage = hero.clientWidth * motion.stageAspect;
          const base = hero.clientHeight - stage * motion.handoffCandleBase;
          return (
            base -
            candle.offsetTop -
            candle.offsetHeight * (1 + candleScale) * 0.5
          );
        },
        duration: span(0.26),
        ease: "sine.inOut",
      },
      at(0.2),
    )
    .fromTo(
      select(".warm-contact-shadow"),
      { autoAlpha: 0 },
      { autoAlpha: 0.22, duration: span(0.1), ease: "sine.out" },
      at(0.34),
    )

    // 6. The candle gives itself up, and only after it has gone does what is
    //    inside it take the same spot on the stone. One hero object at a
    //    time: the fade ends at 0.60, the sandalwood is not readable before
    //    0.62, and the small crossfade between them is deliberate.
    .to(
      select(".warm-contact-shadow"),
      { autoAlpha: 0, duration: span(0.14), ease: "sine.in" },
      at(0.44),
    )
    .to(
      select(".warm-product-layer"),
      {
        scale: candleScale * 0.94,
        autoAlpha: 0,
        duration: span(0.16),
        ease: "sine.in",
      },
      at(0.44),
    )
    .to(scene.track, { autoAlpha: 1, duration: span(0.01) }, at(0.54))
    .fromTo(
      scene.ingredients[0],
      { autoAlpha: 0, scale: 1.025, y: 8 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: span(0.18),
        ease: "power2.out",
      },
      at(0.56),
    )
    .fromTo(
      scene.branch,
      { autoAlpha: 0, y: -40 },
      { autoAlpha: 1, y: 0, duration: span(0.16), ease: "power3.out" },
      at(0.62),
    )
    .fromTo(
      scene.bowl,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: span(0.16), ease: "power3.out" },
      at(0.64),
    )

    // 7. The words name the room before the first note is in it. The heading
    //    starts writing as the candle leaves, and the intro has landed by the
    //    time the sandalwood is readable, so the reader has the title in hand
    //    and the notes arrive into a page that is already introduced.
    .fromTo(
      scene.headingLines,
      { yPercent: 112 },
      {
        yPercent: 0,
        duration: span(0.1),
        stagger: span(0.03),
        ease: "power3.out",
      },
      at(0.46),
    )
    .fromTo(
      scene.intro,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: span(0.07), ease: "power2.out" },
      at(0.52),
    )
    .fromTo(
      scene.rows,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: span(0.07),
        stagger: span(0.02),
        ease: "power2.out",
      },
      at(0.54),
    )
    .fromTo(
      scene.meta,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: span(0.05) },
      at(0.6),
    );
}

// Section 3's own story, appended to the same timeline: three still notes
// with one dissolve between each. Nothing flies; the change is opacity, a
// 2.5% scale and eight pixels of travel, so each state is readable while it
// holds and the reader is never asked to follow a moving object.
function tellTheScents(timeline: gsap.core.Timeline, scene: ScentScene) {
  const base = CHAPTER_UNITS + HANDOFF_UNITS;
  const at = (fraction: number) => base + fraction * SCENT_UNITS;
  const span = (fraction: number) => fraction * SCENT_UNITS;
  const wide = window.innerWidth >= 1024;

  // Depth: each layer drifts its own distance, and settles before cedar's
  // hold ends, so the last frame of Section 3 is completely still.
  const drift: [Element[], number][] = [
    [scene.disc, -24],
    [scene.platform, -36],
    [scene.track, -46],
    [scene.bowl, -52],
    [scene.branch, -80],
  ];
  drift.forEach(([target, y]) => {
    timeline.to(target, { y: wide ? y : y * 0.6, duration: span(0.86) }, at(0));
  });
  timeline
    .fromTo(
      scene.shadow,
      { x: -8, y: -4 },
      { x: 8, y: 5, duration: span(0.86) },
      at(0),
    )
    .to(
      scene.shadow,
      { keyframes: { opacity: [0.18, 0.26, 0.18] }, duration: span(0.86) },
      at(0),
    );

  // One dissolve per boundary. The outgoing note leaves before the incoming
  // one is readable, and the label flips at the midpoint of the pair.
  CROSSFADES.forEach(([from, to], index) => {
    const length = to - from;
    timeline
      .to(
        scene.ingredients[index],
        {
          autoAlpha: 0,
          scale: 1.025,
          y: -8,
          duration: span(length * 0.62),
          ease: "sine.in",
        },
        at(from),
      )
      .fromTo(
        scene.ingredients[index + 1],
        { autoAlpha: 0, scale: 1.025, y: 8 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: span(length * 0.66),
          ease: "sine.out",
          immediateRender: false,
        },
        at(from + length * 0.34),
      );
  });

  // Light follows the scent, on the same boundaries as the imagery: amber
  // warms the room, cedar grounds it. Each tone is uncovered downward from
  // the top of the section — the direction the window light falls — so the
  // room changes the way daylight moves, not the way a filter switches on.
  // The gradient's own values never change; only the edge travels.
  timeline
    .fromTo(
      scene.warmTone,
      { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: span(0.2),
        ease: "power2.out",
        immediateRender: false,
      },
      at(CROSSFADES[0][0]),
    )
    .to(
      scene.warmTone,
      { opacity: 0, duration: span(0.18), ease: "sine.inOut" },
      at(CROSSFADES[1][0]),
    )
    .fromTo(
      scene.groundedTone,
      { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: span(0.2),
        ease: "power2.out",
        immediateRender: false,
      },
      at(CROSSFADES[1][0]),
    );
}

// Phones: no pin and no scrubbing. One sequenced reveal, taps switch scents.
function animateScentEntrance(
  section: HTMLElement,
  onScent: (index: number) => void,
) {
  const q = gsap.utils.selector(section);
  onScent(0);
  gsap
    .timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
    })
    .fromTo(
      q("[data-scent-line]"),
      { yPercent: 112 },
      { yPercent: 0, duration: 0.9, stagger: 0.09 },
      0,
    )
    .fromTo(
      q("[data-scent-intro]"),
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7 },
      0.28,
    )
    .fromTo(
      q(".scent-visual"),
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.85 },
      0.34,
    )
    .fromTo(
      q("[data-scent-row]"),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 },
      0.5,
    )
    .fromTo(
      q("[data-scent-meta]"),
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5 },
      0.7,
    );
}

// Pointer depth writes CSS custom properties, so it composes with the scroll
// transforms instead of fighting them.
function pointerDepth(section: HTMLElement | null, layer: string) {
  const visual = section?.querySelector<HTMLElement>(layer);
  const fine = matchMedia(
    "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
  ).matches;
  if (!section || !visual || !fine) return undefined;
  const offset = { x: 0, y: 0 };
  const apply = () => {
    visual.style.setProperty("--pointer-x", String(offset.x));
    visual.style.setProperty("--pointer-y", String(offset.y));
  };
  // The section's box was measured on every pointer move. Reading geometry
  // after the previous frame's transforms have dirtied the style tree forces
  // a synchronous layout of the whole document, so the cost of following the
  // pointer scaled with the page rather than with the section. The box only
  // changes when the page is resized or the section is scrolled, so it is
  // measured then instead — and lazily, off the pointer's path.
  let box: DOMRect | null = null;
  const measure = () => {
    box = null;
  };
  const rectOf = () => (box ??= section.getBoundingClientRect());
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", measure, { passive: true });
  const onMove = (event: PointerEvent) => {
    const rect = rectOf();
    gsap.to(offset, {
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      duration: 0.8,
      ease: "power3.out",
      overwrite: true,
      onUpdate: apply,
    });
  };
  const onLeave = () =>
    gsap.to(offset, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power3.out",
      overwrite: true,
      onUpdate: apply,
    });
  section.addEventListener("pointermove", onMove);
  section.addEventListener("pointerleave", onLeave);
  return () => {
    window.removeEventListener("resize", measure);
    window.removeEventListener("scroll", measure);
    section.removeEventListener("pointermove", onMove);
    section.removeEventListener("pointerleave", onLeave);
    visual.style.removeProperty("--pointer-x");
    visual.style.removeProperty("--pointer-y");
  };
}

type RitualScene = ReturnType<typeof ritualScene>;

// Section 3 presented the three notes one at a time. They carry over into
// Section 4 as its own assets, each entering away from its final place — in
// fractions of the stage width — and falling back into the still life.
// Each note starts where Section 3 left it — left of frame, a little low and
// a little larger, the size the close-up had them at — and travels to its
// place in the still life. Offsets are fractions of the stage width, so the
// journey is the same shape at every viewport.
// The order Section 4's notes come down in, left to right across the stone.
const NOTE_ORDER = ["sandalwood", "amber", "cedar"];

function ritualScene(section: HTMLElement) {
  const q = gsap.utils.selector(section);
  const stage = section.querySelector<HTMLElement>("[data-ritual-stage]")!;
  return {
    section,
    width: () => stage.clientWidth || section.clientWidth,
    // Wall and sunlight are one element with one owner. The sunlight's own
    // exposure is fixed in CSS and only ever drifts on a time loop, so no
    // scroll position can turn it into the subject of the frame.
    room: q("[data-ritual-room], [data-ritual-shade]"),
    platform: q("[data-ritual-platform]"),
    notes: NOTE_ORDER.map((key) => ({
      key,
      layer: q('[data-ritual-ingredient="' + key + '"]'),
    })),
    ingredients: q("[data-ritual-ingredient]"),
    candle: q("[data-ritual-candle]"),
    linen: q("[data-ritual-linen]"),
    brand: q("[data-ritual-brand]"),
    lines: q("[data-ritual-line]"),
    intro: q("[data-ritual-intro]"),
    specs: q("[data-ritual-specs]"),
    cta: q("[data-ritual-cta]"),
    foot: q("[data-ritual-foot]"),
  };
}

// set(), never from(): no Section 4 layer may paint a frame of its own before
// the handoff asks for it, however early the browser renders.
function hideRitualScene(scene: RitualScene) {
  gsap.set(
    [
      ...scene.room,
      ...scene.platform,
      ...scene.ingredients,
      ...scene.candle,
      ...scene.linen,
      ...scene.brand,
      ...scene.intro,
      ...scene.specs,
      ...scene.cta,
      ...scene.foot,
    ],
    { autoAlpha: 0 },
  );
  gsap.set(scene.lines, { yPercent: 112 });
}

// Section 3 into Section 4: one continuous passage on the one scrubbed
// timeline, authored in fractions of the ritual segment. Cedar holds, the
// scent interface leaves, the three notes carry the frame while the two rooms
// cross underneath them, the slab is uncovered under the notes, and the
// candle they make settles onto it, unlit. Nothing here is a cut: every pair
// of layers that swaps does so on one shared curve, so the exposure of the
// frame only ever moves in one direction. Every entrance is a to() off an
// explicit set(), or a fromTo() with immediateRender false, so no layer
// paints early and the whole passage reverses exactly.
function assembleTheRitual(
  timeline: gsap.core.Timeline,
  scent: ScentScene,
  ritual: RitualScene,
) {
  const base = CHAPTER_UNITS + HANDOFF_UNITS + SCENT_UNITS;
  const at = (fraction: number) => base + fraction * RITUAL_UNITS;
  const span = (fraction: number) => fraction * RITUAL_UNITS;
  const width = ritual.width;

  // 1. 0.00-0.06: cedar holds, alone and still. Then Section 3's words leave.
  //    Its imagery stays: the reader never loses the subject of the frame.
  timeline
    .to(
      scent.headingLines,
      {
        yPercent: -112,
        duration: span(0.12),
        stagger: span(0.02),
        ease: "power2.in",
      },
      at(0.06),
    )
    .to(
      scent.intro,
      { autoAlpha: 0, y: -16, duration: span(0.1), ease: "power1.in" },
      at(0.07),
    )
    .to(
      scent.rows,
      {
        autoAlpha: 0,
        y: -20,
        duration: span(0.1),
        stagger: span(0.015),
        ease: "power1.in",
      },
      at(0.08),
    )
    .to(scent.meta, { autoAlpha: 0, duration: span(0.08) }, at(0.11));

  // 2. Section 3's ingredient leaves with its room. Section 4 is then built
  //    up one object at a time, in the order the reader reads it: the room,
  //    the stone, the notes, the candle.
  timeline.to(
    scent.track,
    { autoAlpha: 0, duration: span(0.2), ease: "sine.inOut" },
    at(0.16),
  );

  timeline
    // 3. 0.16-0.48: one crossfade, one curve. The whole scent chapter dims on
    //    exactly the span the new room brightens on, so the exposure of the
    //    frame moves once, in one direction, with no step at the seam. Room,
    //    sunlight and vignette share this curve, so exposure never switches.
    .fromTo(
      ritual.room,
      { autoAlpha: 0, scale: 1.03 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: span(0.32),
        ease: "sine.inOut",
        immediateRender: false,
      },
      at(0.16),
    )
    .to(
      scent.section,
      { autoAlpha: 0, duration: span(0.32), ease: "sine.inOut" },
      at(0.16),
    )
    // The old room leans away as it goes, so the two stones read as one move.
    .to(
      [...scent.disc, ...scent.platform, ...scent.bowl, ...scent.branch],
      { scale: 1.02, duration: span(0.32), ease: "sine.inOut" },
      at(0.16),
    )

    // 4. 0.20-0.44: the slab is uncovered under the notes — a short mask
    //    reveal upward plus a few pixels of settle, not a fade-in of a whole
    //    object, so the notes look like they were always resting on it.
    .fromTo(
      ritual.platform,
      {
        autoAlpha: 0,
        y: () => width() * 0.018,
        scale: 1.02,
        clipPath: "inset(24% 0% 0% 0%)",
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: span(0.24),
        ease: "power2.out",
        immediateRender: false,
      },
      at(0.2),
    );

  // 5. 0.22-0.54: the notes arrive one at a time, each one coming down into
  //    the room and settling into its own place on the stone. The first one
  //    starts while Section 3 is still dimming, so the frame always has a
  //    subject. They are all at rest before the candle they make arrives.
  ritual.notes.forEach((note, index) => {
    const start = 0.22 + index * 0.08;
    timeline
      .fromTo(
        note.layer,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: span(0.07),
          ease: "sine.out",
          immediateRender: false,
        },
        at(start),
      )
      .fromTo(
        note.layer,
        { y: () => width() * -0.13, scale: 0.97 },
        {
          y: 0,
          scale: 1,
          duration: span(0.16),
          ease: "power3.out",
          immediateRender: false,
        },
        at(start),
      );
  });

  // 6. 0.56-0.80: the candle the three notes make comes down last and
  //    settles on the stone between them. Its opacity finishes first, so the
  //    object is solid while the drop is still settling.
  timeline
    .fromTo(
      ritual.candle,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: span(0.1),
        ease: "sine.out",
        immediateRender: false,
      },
      at(0.56),
    )
    .fromTo(
      ritual.candle,
      { y: () => width() * -0.16, scale: 0.96 },
      {
        y: 0,
        scale: 1,
        duration: span(0.24),
        ease: "power3.out",
        immediateRender: false,
      },
      at(0.56),
    );

  // 7. 0.80-0.96: the linen falls in from off the right edge and the still
  //    life is complete.
  timeline.fromTo(
    ritual.linen,
    { autoAlpha: 0, x: () => width() * 0.03, y: () => width() * 0.035 },
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration: span(0.16),
      ease: "power2.out",
      immediateRender: false,
    },
    at(0.8),
  );
}

// Section 4 itself, and the calmest passage on the site. The handoff has
// finished before this segment starts, so no property here has a second
// owner. Words, then the offer, then a long hold on the finished room: the
// pin only releases — and the footer only becomes reachable — after it.
function closeTheRitual(timeline: gsap.core.Timeline, ritual: RitualScene) {
  const base = CHAPTER_UNITS + HANDOFF_UNITS + SCENT_UNITS + RITUAL_UNITS;
  const at = (fraction: number) => base + fraction * CLOSE_UNITS;
  const span = (fraction: number) => fraction * CLOSE_UNITS;

  timeline
    .fromTo(
      ritual.lines,
      { yPercent: 112 },
      {
        yPercent: 0,
        duration: span(0.1),
        stagger: span(0.04),
        ease: "power3.out",
        immediateRender: false,
      },
      at(0.06),
    )
    .fromTo(
      ritual.brand,
      { autoAlpha: 0, y: -12 },
      {
        autoAlpha: 0.86,
        y: 0,
        duration: span(0.08),
        ease: "power2.out",
        immediateRender: false,
      },
      at(0.2),
    )
    .fromTo(
      ritual.intro,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: span(0.09),
        ease: "power2.out",
        immediateRender: false,
      },
      at(0.28),
    )
    .fromTo(
      ritual.specs,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: span(0.09),
        ease: "power2.out",
        immediateRender: false,
      },
      at(0.42),
    )
    .fromTo(
      ritual.cta,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: span(0.09),
        ease: "power3.out",
        immediateRender: false,
      },
      at(0.56),
    )
    .fromTo(
      ritual.foot,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: span(0.08),
        ease: "sine.out",
        immediateRender: false,
      },
      at(0.62),
    );

  // Depth, in single digits, finished well before the hold begins. From 0.70
  // to 1.00 the composition does not move at all.
  const drift: [Element[], number][] = [
    [ritual.room, -3],
    [ritual.platform, -4],
    [ritual.ingredients, -4],
    [ritual.candle, -4],
    [ritual.linen, -4],
  ];
  drift.forEach(([target, y]) => {
    timeline.to(target, { y, duration: span(0.68) }, at(0));
  });
}

// Phones use the same unlit composition with a short sequenced reveal.
function animateRitualEntrance(ritual: RitualScene) {
  gsap
    .timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: ritual.section, start: "top 72%", once: true },
    })
    // Same story as the desktop handoff: the room, the stone, the notes, the
    // candle, then the words and the bar.
    .to(ritual.room, { autoAlpha: 1, duration: 0.9 }, 0)
    .to(ritual.platform, { autoAlpha: 1, duration: 0.8 }, 0.25)
    .fromTo(
      ritual.ingredients,
      { autoAlpha: 0, scale: 0.97, y: -52 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.14,
        immediateRender: false,
      },
      0.45,
    )
    .fromTo(
      ritual.candle,
      { autoAlpha: 0, scale: 0.96, y: -70 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, immediateRender: false },
      0.95,
    )
    .to(ritual.linen, { autoAlpha: 1, duration: 0.8 }, 1.25)
    .fromTo(
      ritual.lines,
      { yPercent: 112 },
      { yPercent: 0, duration: 0.9, stagger: 0.09 },
      1.4,
    )
    .to(ritual.brand, { autoAlpha: 0.86, duration: 0.5 }, 1.6)
    .fromTo(
      ritual.intro,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: false },
      1.75,
    )
    .fromTo(
      ritual.specs,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: false },
      1.9,
    )
    .fromTo(
      ritual.cta,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: false },
      2.05,
    )
    .to(ritual.foot, { autoAlpha: 1, duration: 0.5 }, 2.15);
}
