import Image from "next/image";

export default function StoryStage() {
  return (
    <div className="journey-stage" aria-hidden="true">
      <div className="journey-camera">
        <Image
          src="/assets/forest-background.png"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
      </div>
      <div className="journey-shade" />
      <div className="journey-mist">
        <Image
          src="/assets/fog-overlay.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="journey-branch branch-near-left">
        <Image
          src="/assets/foreground-left-leaves.png"
          alt=""
          width={900}
          height={900}
          sizes="60vw"
        />
      </div>
      <div className="journey-branch branch-near-right">
        <Image
          src="/assets/foreground-right-leaves.png"
          alt=""
          width={900}
          height={900}
          sizes="55vw"
        />
      </div>
    </div>
  );
}
