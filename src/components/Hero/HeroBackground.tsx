import Image from "next/image";
import HeroWebGL from "./HeroWebGL";
import forest from "../../../public/assets/forest-background.png";

export default function HeroBackground() {
  return (
    <div
      className="environment-scroll scene-layer"
      data-layer="environment"
      aria-hidden="true"
    >
      <div className="forest-drift scene-layer">
        <Image
          src={forest}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={85}
          placeholder="blur"
          className="object-cover"
        />
      </div>
      <HeroWebGL mode="forest" />
      <div className="forest-grade scene-layer" />
      <div className="sunlight scene-layer" />
    </div>
  );
}
