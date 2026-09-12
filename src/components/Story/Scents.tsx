"use client";
import { useState } from "react";
import Image from "next/image";
import ChapterLabel from "./ChapterLabel";

const notes = [
  {
    title: "Green leaves",
    kind: "TOP NOTE",
    description:
      "The first impression. Crisp, green and open, like a breath beneath the canopy.",
    position: "15% 20%",
  },
  {
    title: "Woodland moss",
    kind: "HEART NOTE",
    description:
      "The quiet heart. An earthy softness that recalls the forest floor after rain.",
    position: "55% 90%",
  },
  {
    title: "Soft cedar",
    kind: "BASE NOTE",
    description:
      "What stays. A gentle, woody warmth that settles into the room.",
    position: "85% 40%",
  },
];

export default function Scents() {
  const [selected, setSelected] = useState(0);
  return (
    <section
      id="scents"
      className="story-section scents"
      aria-labelledby="scents-title"
      data-chapter="3"
    >
      <div className="scents-intro">
        <ChapterLabel number="03">THE ATMOSPHERE</ChapterLabel>
        <h2 id="scents-title" className="display-heading" data-reveal>
          A walk in
          <br />
          the woods.
          <br />
          <em>In a scent.</em>
        </h2>
        <p className="body-copy">Three notes. One quiet place.</p>
      </div>
      <div className="scent-explorer">
        <div className="scent-window" aria-hidden="true">
          {notes.map((note, index) => (
            <div
              key={note.kind}
              className={`scent-texture ${selected === index ? "selected" : ""}`}
            >
              <Image
                src="/assets/forest-background.png"
                alt=""
                fill
                sizes="(max-width: 640px) 85vw, 40vw"
                className="object-cover"
                style={{
                  objectPosition: note.position,
                  transform: `scale(${index === 0 ? 1.7 : 2.3})`,
                  transformOrigin: note.position,
                }}
              />
            </div>
          ))}
          <span className="scent-window-index">0{selected + 1} / 03</span>
        </div>
        <div
          className="scent-tabs"
          role="tablist"
          aria-label="Explore scent notes"
        >
          {notes.map((note, i) => (
            <button
              key={note.kind}
              id={`note-tab-${i}`}
              role="tab"
              aria-selected={selected === i}
              aria-controls="scent-description"
              tabIndex={selected === i ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={(event) => {
                let next = i;
                if (event.key === "ArrowRight") next = (i + 1) % 3;
                else if (event.key === "ArrowLeft") next = (i + 2) % 3;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = 2;
                else return;
                event.preventDefault();
                setSelected(next);
                document.getElementById(`note-tab-${next}`)?.focus();
              }}
            >
              <span>{note.kind}</span>
              {note.title}
            </button>
          ))}
        </div>
        <div
          id="scent-description"
          role="tabpanel"
          aria-labelledby={`note-tab-${selected}`}
          tabIndex={0}
        >
          <p className="body-copy" key={selected}>
            {notes[selected].description}
          </p>
        </div>
      </div>
    </section>
  );
}
