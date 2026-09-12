export default function HeroTypography() {
  return (
    <>
      <div className="heading-position" data-layer="typography">
        <h1 id="hero-title" className="hero-heading">
          <span>A QUIETER</span>
          <span>KIND OF LUXURY</span>
        </h1>
      </div>
      <div className="hero-copy">
        <p>
          NATURE INSPIRES.
          <br />
          SCENTS STAY.
        </p>
        <a className="explore-link group" href="#scents">
          <span>EXPLORE THE SCENT</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-500 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>
      </div>
    </>
  );
}
