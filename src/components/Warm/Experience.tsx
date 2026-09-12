"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import Hero, { Candle } from "./Hero";
import Preloader from "./Preloader";
import WarmFooter from "./Footer";
import { playWarmIntro } from "./intro";
import ProductDetails from "./ProductDetails";
import ScentLayers from "./ScentLayers/ScentLayers";
import RitualScene from "./Ritual/RitualScene";
import {
  animateWarmScene,
  gsap,
  motion,
  ScrollTrigger,
  type WarmScene,
} from "./motion";
import dynamic from "next/dynamic";

// The checkout is a whole second screen — form, quantity control, receipt and
// the currency formatter behind it — and it is not on the page until the
// reader asks for it. Loading it with the hero cost the first screen bytes it
// could not use.
const Checkout = dynamic(() => import("../Story/Checkout"));

gsap.registerPlugin(useGSAP, ScrollTrigger);

// `useGSAP` builds the scene in a layout effect, and the lock has to be gone
// by the time it measures the page. A layout effect declared above it runs
// first; on the server there is no layout to run against.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function WarmExperience() {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [scent, setScent] = useState(0);
  // `loaded`: the preloader has finished and left. `introDone`: the hero has
  // finished introducing itself, which is when scroll is handed over.
  const [loaded, setLoaded] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const introPlayed = useRef(false);
  const scene = useRef<WarmScene | null>(null);
  useEffect(() => {
    const scenes = Array.from(
      root.current!.querySelectorAll<HTMLElement>(
        ".warm-hero, .warm-static-details, .ritual",
      ),
    );
    const visible = new Set<Element>();
    const sync = () =>
      scenes.forEach((scene) => {
        scene.classList.toggle(
          "warm-ambient-paused",
          document.hidden || !visible.has(scene),
        );
      });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.001)
            visible.add(entry.target);
          else visible.delete(entry.target);
        });
        sync();
      },
      { threshold: [0, 0.001] },
    );
    scenes.forEach((scene) => observer.observe(scene));
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      scenes.forEach((scene) => scene.classList.remove("warm-ambient-paused"));
    };
  }, []);
  // The page cannot be scrolled while the preloader is up or while the hero
  // is introducing itself, so the entrance is never interrupted halfway.
  // It has to lift before the scroll triggers are measured, or they are built
  // against a page that cannot scroll.
  useBrowserLayoutEffect(() => {
    const root = document.documentElement;
    if (introDone) {
      root.classList.remove("warm-locked");
      return;
    }
    root.classList.add("warm-locked");
    delete document.documentElement.dataset.warmReady;
    return () => root.classList.remove("warm-locked");
  }, [introDone]);

  // The entrance: navigation, then the candle, then the headline letter by
  // letter. It runs once, after the preloader has left, and hands scroll over
  // when it is finished.
  useEffect(() => {
    if (!loaded || introPlayed.current || !root.current) return;
    introPlayed.current = true;
    const timeline = playWarmIntro(root.current, { reduced });
    timeline.eventCallback("onComplete", () => setIntroDone(true));
    if (!timeline.duration()) setIntroDone(true);
    return () => {
      timeline.kill();
    };
  }, [loaded, reduced]);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      if (paused || !introDone || !root.current) return;
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // `warmReady` is the one signal that the site is open for business:
          // the preloader has left, the entrance has played, and the scroll
          // triggers have been measured against the final layout.
          const open = () => {
            document.documentElement.dataset.warmReady = "true";
          };
          if (context.conditions?.reduced) {
            open();
            return;
          }
          const lenis = new Lenis({
            duration: motion.smoothDuration,
            smoothWheel: matchMedia("(pointer: fine)").matches,
            syncTouch: false,
            anchors: true,
            autoRaf: false,
          });
          lenis.on("scroll", ScrollTrigger.update);
          // Lenis stays the only thing that moves the page. The scene asks
          // for the glide across the Section 2 -> Section 3 gap; it is not
          // locked, so the first wheel or touch takes the reader back over.
          scene.current = animateWarmScene(root.current!, setScent, {
            autoScroll: (top, duration) =>
              lenis.scrollTo(top, {
                duration,
                easing: (t: number) => 1 - Math.pow(1 - t, 3),
                lock: false,
              }),
          });
          const tick = (seconds: number) => lenis.raf(seconds * 1000);
          gsap.ticker.add(tick);
          // Every layer is a PNG, and a late decode changes the geometry the
          // triggers were measured against. Measure once, after the fonts and
          // the first screen are ready.
          //
          // Only the first screen. Waiting on every image in the story meant
          // waiting on rooms far below the fold — so the first measurement,
          // and with it the hero's last paint, sat seconds behind an entrance
          // that had already finished. ScrollTrigger measures a layer when it
          // arrives anyway: every image still in flight refreshes the triggers
          // as it lands.
          let active = true;
          const images = Array.from(
            root.current!.querySelectorAll<HTMLImageElement>(
              "img[data-critical]",
            ),
          );
          Promise.allSettled([
            document.fonts.ready,
            ...images.map((image) =>
              image.decode ? image.decode() : Promise.resolve(),
            ),
          ]).then(() => {
            if (!active) return;
            ScrollTrigger.refresh();
            open();
          });
          // A layer that has not landed yet changes the page's height when it
          // finally paints, so the triggers are re-measured then rather than
          // guessed at now. One refresh per frame at most: twenty layers
          // landing together used to mean twenty full re-measurements of the
          // document, back to back, on the main thread.
          const pending = Array.from(
            root.current!.querySelectorAll<HTMLImageElement>("img"),
          ).filter((image) => !image.complete);
          let queued = 0;
          const remeasure = () => {
            if (queued) return;
            queued = requestAnimationFrame(() => {
              queued = 0;
              ScrollTrigger.refresh();
            });
          };
          pending.forEach((image) =>
            image.addEventListener("load", remeasure, { once: true }),
          );
          return () => {
            active = false;
            if (queued) cancelAnimationFrame(queued);
            pending.forEach((image) =>
              image.removeEventListener("load", remeasure),
            );
            gsap.ticker.remove(tick);
            lenis.destroy();
            scene.current?.dispose();
            scene.current = null;
          };
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [paused, introDone], revertOnUpdate: true },
  );

  return (
    <main
      ref={root}
      className={`warm-experience ${paused || reduced ? "warm-still" : ""} ${
        introPlayed.current ? "" : "warm-boot"
      }`}
    >
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}
      <a className="skip-link" href="#about">
        Skip to the story
      </a>
      {/* Chapter two and chapter three share one pinned viewport on desktop,
          so a single timeline can dissolve one into the other. */}
      <div className="warm-chapters" data-story>
        <Hero />
        <section
          className="warm-static-details"
          aria-label="The candle in detail"
        >
          <ProductDetails />
          <div className="warm-static-candle">
            <Candle />
          </div>
        </section>
        <div id="about">
          <ScentLayers
            active={scent}
            onSelect={(index) => scene.current?.selectScent(index)}
          />
        </div>
        <RitualScene onBuy={() => setCheckout(true)} />
      </div>
      <WarmFooter />
      <button
        className="warm-motion-toggle"
        disabled={reduced}
        aria-label={
          reduced
            ? "Reduced motion enabled"
            : paused
              ? "Resume scene motion"
              : "Pause scene motion"
        }
        aria-pressed={paused || reduced}
        onClick={() => setPaused(!paused)}
      >
        {paused || reduced ? "▷" : "Ⅱ"}
        <span>{paused || reduced ? "STILLNESS" : "PAUSE MOTION"}</span>
      </button>
      {checkout && <Checkout onClose={() => setCheckout(false)} />}
    </main>
  );
}
