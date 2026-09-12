"use client";

import Image from "next/image";
import { Arrow } from "../Hero";
import { ritualLayers, ritualSizes, ritualSpecs } from "./ritualData";

const { scene, object, square } = ritualSizes;

// Presentational. The story timeline in `motion.ts` owns every layer here,
// including the three ingredients that carry over from Section 3, so this
// component never animates anything itself.
//
// Every layer is fetched at load but at a low priority and without a preload
// hint. The timeline is scrubbed against this room's measured geometry, so a
// layer that arrives mid-scroll moves the ground under it; they are not
// deferred. What they no longer do is race the hero: eight `priority` layers
// three screens down used to be preloaded ahead of the candle in front of
// the reader.
export default function RitualScene({ onBuy }: { onBuy: () => void }) {
  return (
    <section id="shop" className="ritual" aria-labelledby="ritual-title">
      {/* Wall and sunlight fade in as one room at one fixed exposure. */}
      <div className="ritual-visual" data-ritual-room aria-hidden="true">
        <div className="ritual-layer ritual-layer--background">
          <Image
            src={ritualLayers.background}
            alt=""
            {...scene}
            sizes="100vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div className="ritual-layer ritual-layer--light">
          <Image
            src={ritualLayers.light}
            alt=""
            {...scene}
            sizes="100vw"
            quality={75}
            loading="eager"
            fetchPriority="low"
          />
        </div>
      </div>
      {/* One stage, one aspect ratio, anchored to the bottom of the viewport
          — the same frame Section 3 composes on, so the stone lands on the
          same patch of floor when the two rooms cross. On phones it leaves
          the overlay and takes its place in the column instead. */}
      <div className="ritual-stage" data-ritual-stage aria-hidden="true">
        <div
          className="ritual-layer ritual-layer--platform"
          data-ritual-platform
        >
          <Image
            src={ritualLayers.platform}
            alt=""
            {...object}
            sizes="(max-width: 767px) 96vw, 94vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div
          className="ritual-layer ritual-layer--sandalwood"
          data-ritual-ingredient="sandalwood"
        >
          <Image
            src={ritualLayers.sandalwood}
            alt=""
            {...object}
            sizes="(max-width: 767px) 56vw, 24vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div
          className="ritual-layer ritual-layer--cedar"
          data-ritual-ingredient="cedar"
        >
          <Image
            src={ritualLayers.cedar}
            alt=""
            {...object}
            sizes="(max-width: 767px) 60vw, 20vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div
          className="ritual-layer ritual-layer--amber"
          data-ritual-ingredient="amber"
        >
          <Image
            src={ritualLayers.amber}
            alt=""
            {...square}
            sizes="(max-width: 767px) 26vw, 14vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div className="ritual-layer ritual-layer--candle" data-ritual-candle>
          <span className="ritual-breathe">
            <Image
              src={ritualLayers.candle}
              alt=""
              {...square}
              sizes="(max-width: 767px) 52vw, 33vw"
              quality={90}
              loading="eager"
            fetchPriority="low"
            />
          </span>
        </div>
        <div className="ritual-layer ritual-layer--linen" data-ritual-linen>
          <span className="ritual-drift">
            <Image
              src={ritualLayers.linen}
              alt=""
              {...object}
              sizes="(max-width: 767px) 88vw, 36vw"
              quality={85}
              loading="eager"
            fetchPriority="low"
            />
          </span>
        </div>
      </div>
      {/* A fixed vignette keeps the live text readable. */}
      <div className="ritual-atmosphere" aria-hidden="true">
        <div className="ritual-shade" data-ritual-shade />
      </div>

      <header className="ritual-bar" data-ritual-brand>
        <a className="ritual-logo" href="#home">
          {/* The same mark the hero wears, so the two rooms are one brand. */}
          <Image
            className="ritual-logo-mark"
            src="/assets/logo-mark.png"
            alt=""
            width={640}
            height={640}
            sizes="(max-width: 767px) 58px, 92px"
          />
          <span>AERIS</span>
        </a>
        <button className="ritual-shop" type="button" onClick={onBuy}>
          SHOP
          <Arrow />
        </button>
      </header>

      <div className="ritual-copy">
        <h2
          id="ritual-title"
          className="ritual-heading"
          aria-label="Made for slower evenings."
        >
          <span className="ritual-heading-mask" aria-hidden="true">
            <span className="ritual-kicker" data-ritual-line>
              Made for
            </span>
          </span>
          <span className="ritual-heading-mask" aria-hidden="true">
            <span className="ritual-title" data-ritual-line>
              Slower evenings.
            </span>
          </span>
        </h2>
        <p className="ritual-intro" data-ritual-intro>
          Sandalwood, amber and cedar.
          <br />
          Poured into a ritual made for the quiet hours.
        </p>
      </div>

      <div className="ritual-offer">
        <dl className="ritual-specs" data-ritual-specs>
          {ritualSpecs.map((spec) => (
            <div key={spec.label}>
              <dt>{spec.value}</dt>
              <dd>{spec.label}</dd>
            </div>
          ))}
        </dl>
        <button className="ritual-buy" data-ritual-cta onClick={onBuy}>
          ADD TO BAG
          <Arrow />
        </button>
      </div>

      <div className="ritual-foot" data-ritual-foot aria-hidden="true">
        <span>More than a scent</span>
        <span>A ritual at home</span>
      </div>
    </section>
  );
}
