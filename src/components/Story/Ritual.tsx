import Image from "next/image";
import ChapterLabel from "./ChapterLabel";

export default function Ritual() {
  return (
    <section
      id="ritual"
      className="story-section ritual"
      aria-labelledby="ritual-title"
      data-chapter="5"
    >
      <div className="ritual-halo" aria-hidden="true" />
      <ChapterLabel number="05">THE RITUAL</ChapterLabel>
      <h2 id="ritual-title" className="display-heading" data-reveal>
        Let the day
        <br />
        <em>fall away.</em>
      </h2>
      <div className="ritual-candle" data-parallax>
        <Image
          src="/assets/candle-product.png"
          alt="A warm candle flame against the evening forest"
          width={800}
          height={800}
          sizes="(max-width: 640px) 65vw, 30vw"
        />
      </div>
      <div className="ritual-copy">
        <p className="body-copy">
          Close the laptop. Put down the phone. Let a familiar scent mark the
          space between doing and simply being.
        </p>
        <span className="ritual-signature">
          A little light. A little less hurry.
        </span>
        <a href="#shop" className="text-link">
          BRING THE FOREST HOME <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
