import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Panel } from "./HeroNavbar";
import BrandMark from "./BrandMark";

export default function HeroPanel({
  panel,
  onClose,
}: {
  panel: Panel | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !panel) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    return () => {
      element.close();
      if (previousFocus?.getClientRects().length) previousFocus.focus();
      else document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
    };
  }, [panel]);
  return (
    <dialog
      ref={dialog}
      className="hero-panel"
      aria-labelledby="panel-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel-inner" data-lenis-prevent>
        <button
          className="panel-close"
          onClick={onClose}
          aria-label="Close panel"
        >
          CLOSE <span aria-hidden="true">×</span>
        </button>
        <BrandMark className="panel-mark" />
        {panel === "about" ? (
          <>
            <p className="eyebrow">THE AERIS PHILOSOPHY</p>
            <h2 id="panel-title">
              A little closer
              <br />
              to nature.
            </h2>
            <p>
              For the moments that ask for less. Less noise, less hurry. A soft
              flame, a familiar scent, and room to simply be.
            </p>
            <p>
              Inspired by the stillness of the forest, AERIS brings a quieter
              ritual into your everyday.
            </p>
            <span className="panel-signoff">Nature inspires. Scents stay.</span>
          </>
        ) : (
          <>
            <p className="eyebrow">
              {panel === "shop" ? "THE FIRST CHAPTER" : "SCENT NO. 01"}
            </p>
            <h2 id="panel-title">Forest, after rain.</h2>
            <Image
              className="panel-product"
              src="/assets/candle-product.png"
              alt="AERIS forest candle in ivory ceramic"
              width={280}
              height={280}
              sizes="240px"
            />
            <p>
              Green leaves. Damp earth. Sunlight through the canopy. A quiet
              walk, held in a scent.
            </p>
            <dl className="scent-notes">
              <div>
                <dt>TOP</dt>
                <dd>Green leaves</dd>
              </div>
              <div>
                <dt>HEART</dt>
                <dd>Woodland moss</dd>
              </div>
              <div>
                <dt>BASE</dt>
                <dd>Soft cedar</dd>
              </div>
            </dl>
            {panel === "shop" && (
              <p className="collection-note">
                Collection preview. Online shopping is coming soon.
              </p>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
