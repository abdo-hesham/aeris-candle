import Image from "next/image";

// Seeded positions keep server/client markup identical.
const particles = Array.from({ length: 16 }, (_, i) => ({
  left: 12 + ((i * 37.71) % 76),
  top: 26 + ((i * 19.37) % 59),
  size: 7 + (i % 4) * 3,
}));

export default function HeroAtmosphere() {
  return (
    <div
      className="atmosphere scene-layer"
      data-layer="atmosphere"
      aria-hidden="true"
    >
      <div className="fog-position">
        <div className="fog-drift">
          <Image
            src="/assets/fog-overlay.png"
            alt=""
            width={1280}
            height={720}
            sizes="100vw"
          />
        </div>
      </div>
      <div className="particle-field scene-layer">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
