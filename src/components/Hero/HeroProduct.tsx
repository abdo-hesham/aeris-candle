import Image from "next/image";
import HeroWebGL from "./HeroWebGL";
import candle from "../../../public/assets/candle-product.png";

export default function HeroProduct() {
  return (
    <div className="product-position" data-layer="product">
      <div className="product-shadow" aria-hidden="true" />
      <div className="product-pointer">
        <div className="product-float">
          <div className="product-glow" aria-hidden="true" />
          <HeroWebGL mode="candle" />
          <Image
            className="product-image"
            src={candle}
            alt="AERIS ivory ceramic candle, lit by a small warm flame"
            priority
            sizes="(max-width: 640px) 62vw, (max-width: 1024px) 36vw, 22vw"
            quality={90}
          />
        </div>
      </div>
    </div>
  );
}
