import ScentVisual from "./ScentVisual";
import ScentNavigation from "./ScentNavigation";

// Presentational: the scroll story owns every layer of this section, so the
// section itself only renders and reports which scent the reader has reached.
export default function ScentLayers({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <section
      id="scents"
      className="scent-layers"
      aria-labelledby="scents-title"
      data-active={active}
    >
      <ScentVisual />
      <div className="scent-editorial">
        <div className="scent-head">
          <h2 id="scents-title" className="scent-heading">
            <span className="scent-heading-line">
              <span data-scent-line>Warmth,</span>
            </span>
            <span className="scent-heading-line">
              <em data-scent-line>in layers.</em>
            </span>
          </h2>
          <p className="scent-intro" data-scent-intro>
            Some luxuries are felt, not seen. Soft woods, a golden warmth, and a
            quiet finish. Discover the notes that make the moment yours.
          </p>
        </div>
        <ScentNavigation active={active} onSelect={onSelect} />
      </div>
      <div className="scent-meta" data-scent-meta>
        <span className="scent-meta-count">
          03<i aria-hidden="true" />04
        </span>
        <span>A study in scent</span>
      </div>
    </section>
  );
}
