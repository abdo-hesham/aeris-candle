import Image from "next/image";
import ChapterLabel from "./ChapterLabel";

export default function Discovery() {
  return (
    <section
      id="about"
      className="story-section discovery"
      aria-labelledby="discovery-title"
      data-chapter="2"
    >
      <div className="discovery-copy">
        <ChapterLabel number="02">THE INSPIRATION</ChapterLabel>
        <h2 id="discovery-title" className="display-heading" data-reveal>
          Some things
          <br />
          ask us to
          <br />
          <em>slow down.</em>
        </h2>
        <div className="body-copy" data-reveal>
          <p>
            The hush beneath the trees. Light resting on a leaf. The earthy
            stillness after rain.
          </p>
          <p>
            AERIS begins here. A candle inspired by the forest, made for a
            little more presence in your everyday.
          </p>
        </div>
        <a href="#scents" className="text-link">
          FOLLOW THE SCENT <span aria-hidden="true">↓</span>
        </a>
      </div>
      <figure className="discovery-study" data-parallax>
        <div className="study-image">
          <Image
            src="/assets/forest-background.png"
            alt="Sunlight settling across a bed of woodland moss"
            fill
            sizes="(max-width: 640px) 75vw, 32vw"
            quality={85}
            className="object-cover"
          />
        </div>
        <figcaption>
          A moment from the forest.<span>01 / AERIS</span>
        </figcaption>
      </figure>
      <span className="forest-coordinate" aria-hidden="true">
        A LITTLE CLOSER TO NATURE
      </span>
    </section>
  );
}
