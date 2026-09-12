"use client";
import { useState } from "react";
import Image from "next/image";
import ChapterLabel from "./ChapterLabel";
import { product } from "@/data/product";

const details = [
  {
    name: "The vessel",
    text: "A simple ivory form. A quiet presence, even before the flame is lit.",
  },
  {
    name: "The light",
    text: "A small, warm focal point. Space to pause, without asking for attention.",
  },
  {
    name: "The finish",
    text: "Soft colour and an understated botanical mark, inspired by the world outside.",
  },
];
export default function Craft() {
  const [detail, setDetail] = useState(0);
  return (
    <section
      id="craft"
      className="story-section craft"
      aria-labelledby="craft-title"
      data-chapter="4"
    >
      <div className="craft-top">
        <ChapterLabel number="04">THE OBJECT</ChapterLabel>
        <span className="small-label">CONSIDERED IN EVERY DETAIL</span>
      </div>
      <h2 id="craft-title" className="display-heading" data-reveal>
        Nothing more.
        <br />
        <em>Nothing missing.</em>
      </h2>
      <div className="craft-layout">
        <div className="craft-product" data-parallax>
          <span className="craft-orbit" aria-hidden="true" />
          <Image
            src="/assets/candle-product.png"
            alt="Close-up of the AERIS ivory candle vessel and botanical mark"
            width={800}
            height={800}
            sizes="(max-width: 640px) 90vw, 48vw"
            quality={90}
          />
          {details.map((item, i) => (
            <button
              key={item.name}
              className={`product-hotspot hotspot-${i} ${detail === i ? "selected" : ""}`}
              onClick={() => setDetail(i)}
              aria-pressed={detail === i}
              aria-label={`Explore ${item.name.toLowerCase()}`}
              aria-controls="craft-detail"
            >
              0{i + 1}
            </button>
          ))}
        </div>
        <div className="craft-detail" id="craft-detail">
          <span className="small-label">0{detail + 1} / THE DETAILS</span>
          <h3>{details[detail].name}</h3>
          <p className="body-copy" aria-live="polite">
            {details[detail].text}
          </p>
          <dl className="product-specs">
            {[
              ["WAX", product.wax],
              ["WICK", product.wick],
              ["SIZE", product.size],
              ["BURN TIME", product.burnTime],
            ]
              .filter(([, value]) => value)
              .map(([name, value]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          <a href="#ritual" className="text-link">
            MAKE ROOM FOR A RITUAL <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
