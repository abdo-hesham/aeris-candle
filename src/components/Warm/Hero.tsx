import Image, { getImageProps } from "next/image";
import ProductDetails from "./ProductDetails";

export function Arrow() {
  return (
    <svg viewBox="0 0 44 18" fill="none" aria-hidden="true">
      <path d="M0 9h42M34 1l8 8-8 8" stroke="currentColor" />
    </svg>
  );
}

export function Candle({ className = "" }: { className?: string }) {
  return (
    <div className={`warm-candle ${className}`}>
      <Image
        src="/assets/candle-without-flame.webp"
        alt="AERIS taupe ceramic candle with a delicate ivory emblem"
        width={1145}
        height={1374}
        sizes="(max-width: 767px) 65vw, 30vw"
        quality={90}
        priority
        fetchPriority="high"
        data-critical=""
      />
      {/* The wick. It is dark until the reader has been all the way round the
          ring in chapter two, and the scene lights it there. */}
      <span className="warm-flame" data-flame aria-hidden="true" />
    </div>
  );
}

function HeadingLine({ children }: { children: string }) {
  return (
    <span className="warm-heading-line" aria-hidden="true">
      {Array.from(children).map((character, index) =>
        character === " " ? (
          " "
        ) : (
          <span className="warm-heading-letter" key={`${character}-${index}`}>
            {character}
          </span>
        ),
      )}
    </span>
  );
}

/** The fold the portrait plate is shot for. Kept in step with warm.css — the
 *  two must name the same fold, or a viewport falls in the gap and gets the
 *  phone's layout with the landscape room behind it. */
const TALL_PLATE = "(max-width: 767px) and (max-aspect-ratio: 4 / 5)";

// `priority` here is what marks the plate eager and high-priority. Without
// it getImageProps hands back `loading="lazy"`, and the room the hero stands
// in waits for the scroll that never comes.
const plate = {
  alt: "",
  fill: true,
  sizes: "100vw",
  quality: 85,
  priority: true,
} as const;
const { props: wide } = getImageProps({
  ...plate,
  src: "/assets/background.webp",
});
const { props: tall } = getImageProps({
  ...plate,
  src: "/assets/mobile-hero-section.webp",
});

export default function Hero() {
  return (
    <section id="home" className="warm-hero" aria-labelledby="warm-title">
      {/* Two plates of the same room, one per orientation. The landscape one
          is 16/9: covering an upright phone with it means cropping on height,
          which throws most of the frame away and stretches what is left. The
          portrait plate is shot for that fold — the stone plinth the candle
          stands on is already in frame — so the phone gets the room at its
          own aspect and at full resolution.
          
          They are one <picture>, not two divs hidden from each other with
          `display: none`. A hidden <img> is still fetched: every desktop
          reader was paying for the phone plate as well as their own, and both
          were preloaded ahead of the candle. A <source media> is read by the
          preload scanner, so exactly one plate is ever requested. */}
      <div className="warm-background" aria-hidden="true">
        <picture>
          <source media={TALL_PLATE} srcSet={tall.srcSet} sizes={tall.sizes} />
          <img {...wide} alt="" data-critical="" />
        </picture>
      </div>
      <div className="warm-fire-glow" aria-hidden="true" />
      <div className="warm-haze" aria-hidden="true" />
      <div className="warm-product-details">
        <ProductDetails />
      </div>
      {/* The room warms through these washes, then they lift and the scent
          room behind this chapter becomes the room. */}
      <div className="warm-wash-stack" aria-hidden="true">
        <div className="warm-wash warm-wash--taupe" />
        <div className="warm-wash warm-wash--sand" />
        <div className="warm-wash warm-wash--ivory" />
      </div>
      <header className="warm-nav">
        <a className="warm-brand-lockup" href="#home" aria-label="AERIS home">
          {/* No `priority`. It emitted a <link rel="preload" as="image"> into
              the head ahead of the stylesheets, so a 62px mark that is hidden
              behind the preloader anyway was queued in front of the CSS. It is
              in the viewport, so it is still fetched on the first pass — just
              behind the things the first frame actually needs. */}
          <Image
            className="warm-brand-mark"
            src="/assets/logo-mark.png"
            alt=""
            width={640}
            height={640}
            sizes="62px"
            data-critical=""
          />
          <span className="warm-wordmark">AERIS</span>
        </a>
      </header>
      <p className="warm-hero-eyebrow">MORE THAN A SCENT</p>
      <h1
        id="warm-title"
        className="warm-heading"
        aria-label="A WARMER KIND OF LUXURY"
      >
        <HeadingLine>A WARMER</HeadingLine>
        <HeadingLine>KIND OF LUXURY</HeadingLine>
      </h1>
      <div className="warm-intro">
        <p>
          RITUAL BEGINS.
          <br />
          COMFORT STAYS.
        </p>
        <a className="warm-text-link" href="#scents">
          <span>EXPLORE THE SCENT</span>
          <Arrow />
        </a>
      </div>
      <div className="warm-product-layer">
        <Candle />
        <span className="warm-contact-shadow" aria-hidden="true" />
      </div>
      <div className="warm-scroll-cue" aria-hidden="true">
        <span>SCROLL TO DISCOVER</span>
        <i />
      </div>
    </section>
  );
}
