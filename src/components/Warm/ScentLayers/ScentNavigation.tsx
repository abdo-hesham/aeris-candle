"use client";

import { scents } from "./scentData";

export default function ScentNavigation({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ul className="scent-nav" data-scent-nav>
      {scents.map((scent, index) => (
        <li key={scent.key}>
          <button
            type="button"
            className="scent-row"
            data-scent-row={index}
            aria-current={active === index ? "true" : undefined}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => {
              let next = index;
              if (["ArrowDown", "ArrowRight"].includes(event.key))
                next = (index + 1) % scents.length;
              else if (["ArrowUp", "ArrowLeft"].includes(event.key))
                next = (index + scents.length - 1) % scents.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = scents.length - 1;
              else return;
              event.preventDefault();
              onSelect(next);
              document
                .querySelector<HTMLElement>(`[data-scent-row="${next}"]`)
                ?.focus();
            }}
          >
            <span className="scent-row-index">
              {scent.index}
              <i aria-hidden="true" />
            </span>
            <span className="scent-row-name">{scent.name}</span>
            <span className="scent-row-copy">
              <small>{scent.feeling}</small>
              <span>{scent.description}</span>
            </span>
            <span className="scent-row-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" />
              </svg>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
