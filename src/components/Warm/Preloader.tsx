"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** Circumference of the r=48 progress ring, in user units. */
const RING = 2 * Math.PI * 48;
/**
 * The plate holds no floor of its own: it leaves the moment the fonts and the
 * first screen's images have settled. The floor used to be 1.1s, and the plate
 * is what the hero's candle — the LCP element — is painting behind, so that
 * second and a bit was added to the site's LCP on every visit, including the
 * ones where the hero was ready long before it. The counter's own close still
 * takes a handful of frames, so the arc is never cut off mid-sweep.
 */
const MIN_VISIBLE = 0;
/** A stalled image must not hold the site shut: past this, the plate leaves. */
const MAX_VISIBLE = 12000;
/** How fast the counter chases its target, per frame, before and after `load`. */
const EASE_WAITING = 0.08;
const EASE_CLOSING = 0.24;
/** Counting every image on every frame is wasted work; ten times a second is
 *  more than the eye can read off a two-digit number. */
const MEASURE_INTERVAL = 100;

type Props = {
  /** Called once the plate has finished leaving, so the intro can begin. */
  onDone: () => void;
};

/**
 * The first room. It covers the hero until the page has genuinely finished
 * loading — the images the first screen needs decoded, every font ready — so
 * the reader never sees a half-painted hero, and the entrance animation always
 * starts on a complete frame.
 *
 * Progress is real: it tracks how many of the eagerly-loaded images have
 * finished, and only closes the last of the arc once the window `load` event
 * has fired.
 *
 * The counter runs on the frame loop, not on React state. Setting state every
 * frame re-rendered this whole subtree sixty times a second for as long as the
 * plate was up, which cost long tasks on the main thread at the exact moment
 * the page was trying to finish loading — and the plate is what the hero's
 * paint is waiting on, so its own overhead pushed the site's LCP out. Only
 * `leaving` is state; the arc, the bead and the number are written straight to
 * the DOM.
 */
export default function Preloader({ onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let frame = 0;
    let shown = 0;
    let complete = false;
    let finished = false;
    let measured = 0;
    let measuredAt = -Infinity;
    let painted = -1;
    const started = performance.now();
    const critical = Array.from(
      document.querySelectorAll<HTMLImageElement>("img[data-critical]"),
    );

    /**
     * Fraction of the images the first screen needs that have finished.
     *
     * Only the ones marked `data-critical` count: the plate itself and the
     * four layers of the hero. Every other image on the page — the rooms of
     * chapters three and four — is fetched in the background at a lower
     * priority and must not hold the plate up, or the reader waits on a room
     * three screens down before being shown the one in front of them.
     */
    const measure = () => {
      if (!critical.length) return 1;
      let done = 0;
      critical.forEach((image) => {
        if (image.complete) done += 1;
      });
      return done / critical.length;
    };

    /** The three things on this screen that move, written without React. */
    const paint = (value: number) => {
      const whole = Math.round(value * 100);
      if (whole === painted) return;
      painted = whole;
      arc.current?.setAttribute("stroke-dashoffset", String(RING * (1 - value)));
      if (head.current)
        head.current.style.transform = `rotate(${whole * 3.6}deg)`;
      if (readout.current) readout.current.textContent = `${whole} %`;
      root.current?.setAttribute("aria-label", `Loading, ${whole} percent`);
    };

    // The counter eases toward the real figure and never walks backwards, so a
    // late image joining the document cannot make the number drop.
    const tick = (now: number) => {
      if (!complete && now - measuredAt >= MEASURE_INTERVAL) {
        measuredAt = now;
        // Before `load`, the bar is capped at 92%: the last step belongs to the
        // browser telling us the page is actually done.
        measured = Math.min(measure(), 0.92);
      }
      const target = complete ? 1 : measured;
      shown += (target - shown) * (complete ? EASE_CLOSING : EASE_WAITING);
      if (target - shown < 0.004) shown = target;
      paint(shown);

      const held = now - started >= MIN_VISIBLE;
      if (complete && held && shown >= 1 && !finished) {
        finished = true;
        setLeaving(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const ready = () => {
      complete = true;
    };
    const failsafe = window.setTimeout(ready, MAX_VISIBLE);
    // The plate used to wait on `window.load`, which is every byte on the
    // page: the twenty-odd layers of the rooms below, each one a large PNG.
    // The plate sits on top of the hero, so the hero's candle — the largest
    // thing the reader sees — could not be painted until all of them landed,
    // and the site's LCP was the moment the last background three screens
    // down finished. It waits on the first screen now, and nothing else.
    const settled = (image: HTMLImageElement) =>
      image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
    Promise.allSettled([document.fonts.ready, ...critical.map(settled)]).then(
      ready,
    );

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, []);

  // The plate leaves on its own 0.72s transition. `onDone` fires just before
  // that finishes, so the hero's entrance starts under the last of the fade
  // rather than after it: the reader sees one continuous move, and the hero's
  // first paint is not held back by a plate that is already almost gone.
  useEffect(() => {
    if (!leaving) return;
    const node = root.current;
    if (!node) return;
    const timer = window.setTimeout(onDone, 600);
    return () => window.clearTimeout(timer);
  }, [leaving, onDone]);

  return (
    <div
      ref={root}
      className={`warm-preloader ${leaving ? "warm-preloader--leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading, 0 percent"
    >
      {/* The reference plate, held far enough out of focus that it reads as
          room light rather than as a picture.

          The blur is baked into the file, not applied by the browser: this is
          the first thing painted on the page, and blurring a full-viewport
          picture on that frame cost about 0.7s of it on a throttled phone. A
          320px plate carrying its own blur is 886 bytes, needs no image
          transform, and draws the same wall of light. */}
      <div className="warm-preloader-plate" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/preloader-plate.webp"
          alt=""
          width={320}
          height={180}
          fetchPriority="high"
          decoding="async"
          data-critical=""
        />
      </div>
      <div className="warm-preloader-vignette" aria-hidden="true" />
      <div className="warm-preloader-shaft" aria-hidden="true" />

      <div className="warm-preloader-core">
        <div className="warm-preloader-ring" aria-hidden="true">
          {/* The rim itself: a blurred band of the room behind it, lit along
              one edge, so the arc reads as light caught in glass. */}
          <span className="warm-preloader-glass" />
          <span className="warm-preloader-sheen" />
          <svg viewBox="0 0 100 100">
            <defs>
              {/* Warm metal is not one colour: a bright edge, a deeper amber
                  belly, and a highlight coming back. */}
              <linearGradient
                id="warm-preloader-silver"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#fff7e8" />
                <stop offset="26%" stopColor="#f3ddb6" />
                <stop offset="52%" stopColor="#c08d4e" />
                <stop offset="74%" stopColor="#efd9b2" />
                <stop offset="100%" stopColor="#fff6e4" />
              </linearGradient>
            </defs>
            <circle className="warm-preloader-track" cx="50" cy="50" r="48" />
            <circle
              ref={arc}
              className="warm-preloader-arc"
              cx="50"
              cy="50"
              r="48"
              strokeDasharray={RING}
              strokeDashoffset={RING}
            />
          </svg>
          <span ref={head} className="warm-preloader-head" />
          {/* Served straight from /public: the mark is the one thing on this
              screen that must not wait on an image transform. It is a 384px
              copy of the master, because 191px is the largest it is ever
              drawn — the 1254px master cost 168KB to show a 191px mark, and
              the 640px copy still sent twice the pixels a retina screen can
              use. */}
          <Image
            className="warm-preloader-logo"
            src="/assets/logo-mark-384.png"
            alt=""
            width={384}
            height={384}
            priority
            unoptimized
            data-critical=""
          />
        </div>
        <p className="warm-preloader-label">LOADING</p>
        <span className="warm-preloader-rule" aria-hidden="true" />
        <p ref={readout} className="warm-preloader-percent">
          0 %
        </p>
      </div>
    </div>
  );
}
