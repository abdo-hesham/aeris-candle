import Image from "next/image";

export default function HeroLeaves() {
  return (
    <div className="leaves-layer scene-layer" aria-hidden="true">
      <div className="leaf-position leaf-left" data-layer="branches-left">
        <div className="leaf-breeze-left">
          <Image
            src="/assets/foreground-left-leaves.png"
            alt=""
            width={900}
            height={900}
            sizes="(max-width: 640px) 60vw, 37vw"
          />
        </div>
      </div>
      <div className="leaf-position leaf-right" data-layer="branches-right">
        <div className="leaf-breeze-right">
          <Image
            src="/assets/foreground-right-leaves.png"
            alt=""
            width={900}
            height={900}
            sizes="(max-width: 640px) 65vw, 32vw"
          />
        </div>
      </div>
    </div>
  );
}
