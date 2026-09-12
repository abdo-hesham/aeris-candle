"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroNavbar from "./HeroNavbar";
import HeroBackground from "./HeroBackground";
import HeroAtmosphere from "./HeroAtmosphere";
import HeroLeaves from "./HeroLeaves";
import HeroProduct from "./HeroProduct";
import HeroTypography from "./HeroTypography";
import { createAmbientAnimations } from "./heroAnimations";
import { useSceneMotion } from "../Story/MotionContext";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const animations = useRef<gsap.core.Animation[]>([]);
  const { paused, reduced } = useSceneMotion();
  useGSAP(
    () => {
      if (!root.current) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        animations.current = createAmbientAnimations(root.current!);
        return () => {
          animations.current = [];
        };
      });
      return () => media.revert();
    },
    { scope: root },
  );
  useEffect(() => {
    let visible = true;
    const sync = () =>
      animations.current.forEach((a) =>
        a.paused(paused || !visible || document.hidden),
      );
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, reduced]);
  useGSAP(
    () => {
      if (!root.current || paused) return;
      const media = gsap.matchMedia();
      media.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const element = root.current!;
          const target = element.querySelector(".product-pointer");
          const x = gsap.quickTo(target, "x", {
            duration: 1.5,
            ease: "power2.out",
          });
          const y = gsap.quickTo(target, "y", {
            duration: 1.5,
            ease: "power2.out",
          });
          const move = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect();
            x(((event.clientX - rect.left) / rect.width - 0.5) * 10);
            y(((event.clientY - rect.top) / rect.height - 0.5) * 5);
          };
          const reset = () => {
            x(0);
            y(0);
          };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", reset);
          return () => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", reset);
          };
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [paused], revertOnUpdate: true },
  );
  return (
    <section
      id="home"
      ref={root}
      className="hero"
      aria-labelledby="hero-title"
      data-chapter="1"
    >
      <HeroBackground />
      <HeroTypography />
      <HeroAtmosphere />
      <HeroProduct />
      <HeroLeaves />
      <HeroNavbar />
      <div className="hero-bottom">
        <p>
          <span className="chapter-number">01</span>
          <span className="chapter-line" />
          THE FOREST COLLECTION
        </p>
        <a className="hero-scroll" href="#about">
          STEP INTO THE FOREST <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
