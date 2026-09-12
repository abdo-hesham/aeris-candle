"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import Hero from "../Hero/Hero";
import Discovery from "./Discovery";
import Scents from "./Scents";
import Craft from "./Craft";
import Ritual from "./Ritual";
import Purchase from "./Purchase";
import StoryStage from "./StoryStage";
import { MotionContext } from "./MotionContext";
import "@/app/story.css";
import "@/app/editorial.css";
import { createForestStory, ScrollTrigger } from "./storyAnimations";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const chapters = ["home", "about", "scents", "craft", "ritual", "shop"];

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [chapter, setChapter] = useState(1);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setChapter(Number((entry.target as HTMLElement).dataset.chapter));
        }),
      { rootMargin: "-35% 0px -45% 0px" },
    );
    root.current
      ?.querySelectorAll("[data-chapter]")
      .forEach((section) => observer.observe(section));
    return () => {
      media.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);
  useGSAP(
    () => {
      if (!root.current || paused) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        createForestStory(root.current!);
        const lenis = new Lenis({
          duration: 1.15,
          smoothWheel: true,
          autoRaf: false,
          anchors: true,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (seconds: number) => lenis.raf(seconds * 1000);
        gsap.ticker.add(tick);
        const refresh = () => ScrollTrigger.refresh();
        document.fonts.ready.then(() => {
          if (root.current) refresh();
        });
        return () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [paused], revertOnUpdate: true },
  );

  return (
    <MotionContext.Provider value={{ paused, reduced }}>
      <main
        ref={root}
        className={`experience ${paused || reduced ? "motion-still" : ""}`}
      >
        <a className="skip-link" href="#shop">
          Skip to the candle
        </a>
        <Hero />
        <div className="forest-journey">
          <StoryStage />
          <Discovery />
          <Scents />
          <Craft />
          <Ritual />
        </div>
        <Purchase />
        <nav
          className={`chapter-dock ${chapter > 1 ? "visible" : ""}`}
          aria-label="Story chapters"
        >
          <a href="#home" className="dock-brand">
            AERIS
          </a>
          <span className="dock-count">0{chapter} / 06</span>
          <a href="#shop" className="dock-shop">
            THE CANDLE <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <nav className="chapter-dots" aria-label="Jump to chapter">
          {chapters.map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              aria-label={`Chapter ${i + 1}: ${id === "home" ? "Arrival" : id}`}
              aria-current={chapter === i + 1 ? "step" : undefined}
            >
              <span />
            </a>
          ))}
        </nav>
        <button
          className="global-motion"
          disabled={reduced}
          aria-pressed={paused || reduced}
          aria-label={
            reduced
              ? "Reduced motion enabled"
              : paused
                ? "Resume scene motion"
                : "Pause scene motion"
          }
          onClick={() => setPaused(!paused)}
        >
          <span aria-hidden="true">{paused || reduced ? "▷" : "Ⅱ"}</span>
          {reduced ? "STILLNESS" : paused ? "RESUME MOTION" : "PAUSE MOTION"}
        </button>
      </main>
    </MotionContext.Provider>
  );
}
