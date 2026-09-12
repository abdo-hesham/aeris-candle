import { product } from "@/data/product";

export default function ProductDetails() {
  return (
    <div className="warm-focus-content">
      <div className="warm-focus-light" aria-hidden="true" />
      <div className="warm-focus-heading">
        <span className="warm-eyebrow">THE WARMTH COLLECTION</span>
        <h2>
          A quiet kind of <em>extraordinary.</em>
        </h2>
      </div>
      <div className="warm-product-orbit" aria-label="Candle details">
        <div className="warm-orbit-ring" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="warm-orbit-trace">
            <circle className="warm-orbit-track" cx="50" cy="50" r="49.8" />
            <circle
              className="warm-orbit-progress"
              cx="50"
              cy="50"
              r="49.8"
              pathLength="1"
              transform="rotate(135 50 50)"
            />
            <circle
              className="warm-orbit-dot warm-orbit-dot--one"
              cx="14.786"
              cy="14.786"
              r="1.05"
            />
            <circle
              className="warm-orbit-dot warm-orbit-dot--two"
              cx="85.214"
              cy="14.786"
              r="1.05"
            />
            <circle
              className="warm-orbit-dot warm-orbit-dot--three"
              cx="14.786"
              cy="85.214"
              r="1.05"
            />
            <circle
              className="warm-orbit-dot warm-orbit-dot--four"
              cx="85.214"
              cy="85.214"
              r="1.05"
            />
            <circle
              className="warm-orbit-head"
              cx="14.786"
              cy="85.214"
              r="0.8"
            />
          </svg>
        </div>
        <div className="warm-orbit-note warm-orbit-note--one">
          <span>
            Thoughtfully simple<strong>{product.wax}</strong>
          </span>
        </div>
        <div className="warm-orbit-note warm-orbit-note--two">
          <span>
            Time to slow down<strong>{product.burnTime} of warmth</strong>
          </span>
        </div>
        <div className="warm-orbit-note warm-orbit-note--three">
          <span>
            A comforting fragrance<strong>Sandalwood &amp; amber</strong>
          </span>
        </div>
        <div className="warm-orbit-note warm-orbit-note--four">
          <span>
            A grounding finish<strong>Soft cedar</strong>
          </span>
        </div>
      </div>
      <div className="warm-focus-caption">
        <span>
          {product.size} candle · ${product.price} {product.currency}
        </span>
        <p>Made for the moments you call your own.</p>
      </div>
    </div>
  );
}
