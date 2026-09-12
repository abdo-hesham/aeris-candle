"use client";
import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "../Story/MotionContext";
import type * as Three from "three";

/** Actual geometry; images remain only for loading and context-loss fallback. */
export default function HeroWebGL({ mode }: { mode: "forest" | "candle" }) {
  const host = useRef<HTMLDivElement>(null);
  const { paused, reduced } = useSceneMotion();
  const still = useRef(paused || reduced);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    still.current = paused || reduced;
  }, [paused, reduced]);
  useEffect(() => {
    if (!host.current) return;
    const container = host.current,
      hero = container.closest<HTMLElement>(".hero")!;
    let disposed = false,
      cleanup = () => {};
    void (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const compact = window.innerWidth < 768;
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: mode === "candle",
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch {
        return;
      }
      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          mode === "forest" ? (compact ? 1.25 : 1.5) : 2,
        ),
      );
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.shadowMap.enabled = mode === "forest";
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      if (mode === "candle") renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera =
        mode === "forest"
          ? new THREE.PerspectiveCamera(47, 1, 0.1, 110)
          : new THREE.OrthographicCamera(-1.52, 1.52, 1.52, -1.52, 0.1, 40);
      let texture: Three.Texture | undefined;
      const forestTextures: Three.Texture[] = [];
      const disposeScene = () => {
        const geometries = new Set<Three.BufferGeometry>(),
          materials = new Set<Three.Material>();
        scene.traverse((object) => {
          const mesh = object as Three.Mesh;
          if (mesh.geometry) geometries.add(mesh.geometry);
          if (mesh.material)
            (Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]
            ).forEach((m) => materials.add(m));
        });
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        texture?.dispose();
        forestTextures.forEach((texture) => texture.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
      cleanup = disposeScene;
      let update: (time: number, x: number, y: number) => void;
      try {
        if (mode === "forest") {
          const { createForestScene } = await import("./forestScene");
          if (disposed) return;
          const forest = await createForestScene(scene, compact);
          forestTextures.push(...forest.textures);
          update = forest.update;
          camera.position.set(0, 2.3, 8);
          camera.lookAt(0, 3, -10);
        } else {
          const { createCandleScene } = await import("./candleScene");
          if (disposed) return;
          const candle = await createCandleScene(
            scene,
            camera as Three.OrthographicCamera,
          );
          texture = candle.texture;
          update = candle.update;
          if (disposed) {
            disposeScene();
            return;
          }
        }
      } catch {
        disposeScene();
        cleanup = () => {};
        return;
      }
      if (disposed) {
        disposeScene();
        return;
      }
      let frame = 0,
        elapsed = 0,
        last = 0,
        visible = true,
        lost = false;
      const target = { x: 0, y: 0 },
        pointer = { x: 0, y: 0 };
      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = width / height;
          camera.fov = width < 768 ? 56 : 47;
        }
        camera.updateProjectionMatrix();
        renderer.shadowMap.needsUpdate = true;
        renderer.render(scene, camera);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = hero.getBoundingClientRect();
        target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      };
      const onLeave = () => {
        target.x = target.y = 0;
      };
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      const draw = (time: number) => {
        frame = 0;
        if (disposed || lost || !visible || document.hidden) return;
        const delta = Math.min((time - last) / 1000, 0.05);
        last = time;
        if (!still.current) {
          elapsed += delta;
          pointer.x += (target.x - pointer.x) * Math.min(delta * 2.5, 1);
          pointer.y += (target.y - pointer.y) * Math.min(delta * 2.5, 1);
          if (mode === "forest") {
            const progress = THREE.MathUtils.clamp(
              -hero.getBoundingClientRect().top / hero.offsetHeight,
              0,
              1,
            );
            camera.position.set(
              pointer.x * 0.42 + Math.sin(elapsed * 0.12) * 0.08,
              2.3 - pointer.y * 0.17,
              8 - progress * 3.6,
            );
            camera.lookAt(pointer.x * 0.12, 3 - pointer.y * 0.06, -10);
          }
          update(elapsed, pointer.x, pointer.y);
          renderer.render(scene, camera);
        }
        frame = requestAnimationFrame(draw);
      };
      const resume = () => {
        if (visible && !document.hidden && !frame && !lost) {
          last = performance.now();
          frame = requestAnimationFrame(draw);
        }
      };
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else resume();
      });
      intersection.observe(hero);
      const visibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else resume();
      };
      document.addEventListener("visibilitychange", visibility);
      const readyClass = `has-webgl-${mode}`;
      const onLost = (event: Event) => {
        event.preventDefault();
        lost = true;
        setReady(false);
        hero.classList.remove(readyClass);
        container.parentElement?.classList.remove(readyClass);
        cancelAnimationFrame(frame);
        frame = 0;
      };
      renderer.domElement.addEventListener("webglcontextlost", onLost);
      hero.classList.add(readyClass);
      container.parentElement?.classList.add(readyClass);
      setReady(true);
      container.dataset.scene =
        mode === "forest" ? "modeled-forest" : "projected-ceramic";
      container.dataset.triangles = String(renderer.info.render.triangles);
      container.dataset.drawCalls = String(renderer.info.render.calls);
      resume();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        intersection.disconnect();
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", visibility);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        hero.classList.remove(readyClass);
        container.parentElement?.classList.remove(readyClass);
        disposeScene();
      };
    })().catch(() => {
      /* Preserve the photographic fallback if WebGL is unavailable. */
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [mode]);
  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`hero-webgl webgl-${mode} ${ready ? "ready" : ""}`}
    />
  );
}
