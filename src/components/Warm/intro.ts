import { gsap } from "./motion";

/**
 * The hero's entrance, played once, after the preloader has left.
 *
 * Order is deliberate and matches the way the hero leaves on scroll, run
 * backwards: the navigation arrives first, the candle is set down in the room,
 * and only then does the headline write itself in letter by letter.
 *
 * Every tween is a `fromTo`: both ends are written down, so a refresh or a
 * `ScrollTrigger.refresh()` landing mid-entrance can never leave a layer
 * parked at an interpolated opacity.
 */
export function playWarmIntro(
  root: HTMLElement,
  { reduced = false }: { reduced?: boolean } = {},
): gsap.core.Timeline {
  const select = gsap.utils.selector(root);
  const mobile = window.innerWidth < 768;

  // The CSS boot state hands the layers over hidden; from here GSAP owns them.
  root.classList.remove("warm-boot");

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  if (reduced) {
    timeline.set(
      select(
        ".warm-nav, .warm-product-layer, .warm-hero-eyebrow, .warm-intro > *, .warm-scroll-cue, .warm-heading-letter",
      ),
      { autoAlpha: 1, clearProps: "transform" },
    );
    return timeline;
  }

  timeline
    // 1 — the navigation settles in.
    .fromTo(
      select(".warm-nav"),
      { y: -18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9 },
      0,
    )
    // 2 — the candle is set down: it rises into the light and steadies.
    //     It leads the entrance rather than following the navigation, because
    //     the vessel is the hero's largest element and therefore the paint the
    //     page's LCP is measured on: every tenth of a second it waits here is
    //     a tenth of a second on the site's loading score.
    //     It rises on `y` alone. Scaling it up from 0.94 meant its first paint
    //     was smaller than its last, and the browser measures LCP on the
    //     largest paint: the entry was re-recorded at the end of the entrance
    //     rather than at its start, which cost the page two and a half seconds
    //     of reported load time for a six-percent change nobody can see.
    .fromTo(
      select(".warm-product-layer"),
      { y: mobile ? 44 : 68, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1.05, ease: "power2.out" },
      0.2,
    )
    .fromTo(
      select(".warm-contact-shadow"),
      { scaleX: 0.6, autoAlpha: 0 },
      { scaleX: 1, autoAlpha: 1, duration: 1.1, ease: "sine.out" },
      0.45,
    )
    .fromTo(
      select(".warm-fire-glow"),
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1.2, ease: "sine.inOut" },
      0.3,
    )
    // 3 — the eyebrow, then the headline, letter after letter. This is the
    // exact move the scroll timeline uses to take the headline away, mirrored:
    // there the letters lift and go, here they rise into place.
    .fromTo(
      select(".warm-hero-eyebrow"),
      { y: -10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7 },
      1.0,
    )
    .fromTo(
      select(".warm-heading-letter"),
      { yPercent: 42, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.62,
        ease: "power3.out",
        stagger: { each: mobile ? 0.018 : 0.028, from: "start" },
      },
      1.15,
    )
    // 4 — the rest of the room catches up.
    .fromTo(
      select(".warm-intro > *"),
      { y: 10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08 },
      "-=0.5",
    )
    .fromTo(
      select(".warm-scroll-cue"),
      { y: 10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6 },
      "-=0.3",
    );

  return timeline;
}
