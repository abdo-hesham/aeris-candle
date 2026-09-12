import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createForestStory(root: HTMLElement) {
  const select = gsap.utils.selector(root);
  const mobile = window.matchMedia("(max-width: 640px)").matches;
  const hero = root.querySelector<HTMLElement>(".hero")!;
  const journey = root.querySelector<HTMLElement>(".forest-journey")!;
  // The visitor passes through the near branches while distant trees move slowly.
  const arrival = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 0.65,
      invalidateOnRefresh: true,
    },
  });
  arrival
    .addLabel("leave-clearing", 0)
    .to(
      select(".environment-scroll"),
      { yPercent: 24, scale: mobile ? 1.08 : 1.2, duration: 1 },
      0,
    )
    .to(select(".leaf-left"), { xPercent: 30, scale: 1.4, duration: 1 }, 0)
    .to(select(".leaf-right"), { xPercent: -24, scale: 1.35, duration: 1 }, 0)
    .to(
      select(".product-position"),
      { yPercent: -20, scale: 0.94, duration: 1 },
      0,
    )
    .to(
      select(".heading-position, .hero-copy"),
      { opacity: 0, duration: 0.5 },
      0.1,
    );

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: journey,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  timeline
    .addLabel("discovery", 0)
    .to(
      select(".journey-camera"),
      { scale: mobile ? 1.16 : 1.38, xPercent: mobile ? -2 : -5, duration: 1 },
      0,
    )
    .to(
      select(".branch-near-left"),
      { xPercent: -45, yPercent: 20, scale: 1.6, duration: 0.45 },
      0,
    )
    .to(
      select(".branch-near-right"),
      { xPercent: 40, yPercent: -15, scale: 1.5, duration: 0.45 },
      0,
    )
    .to(
      select(".journey-mist"),
      { xPercent: 12, opacity: 0.06, duration: 0.6 },
      0,
    )
    .addLabel("scent", 0.22)
    .to(select(".journey-shade"), { opacity: 0.83, duration: 0.28 }, 0.2)
    .addLabel("craft", 0.45)
    .addLabel("dusk", 0.7)
    .to(select(".journey-shade"), { opacity: 0.94, duration: 0.3 }, 0.65)
    .addLabel("home", 1);

  select("[data-reveal]").forEach((element: HTMLElement) =>
    gsap.from(element, {
      y: mobile ? 18 : 35,
      opacity: 0,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 94%",
        toggleActions: "play none none reverse",
      },
    }),
  );
  select("[data-parallax]").forEach((element: HTMLElement) =>
    gsap.fromTo(
      element,
      { y: mobile ? 12 : 35 },
      {
        y: mobile ? -12 : -35,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.65,
        },
      },
    ),
  );
  return { arrival, timeline };
}

export { ScrollTrigger };
