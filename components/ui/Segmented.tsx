"use client";

import React, { useLayoutEffect, useRef } from "react";

interface Option<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * A row of toggle buttons with one ink plate that glides to the active option,
 * stretching to its width on the way (and across rows when the group wraps).
 * The plate is positioned by writing to the DOM, so switching never re-renders twice.
 */
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  showCounts = true,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  showCounts?: boolean;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const plate = plateRef.current;
    if (!group || !plate) return;

    const place = () => {
      const active = group.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!active) return;
      // The first placement lands without travelling in from the corner
      if (!placed.current) plate.style.transition = "none";
      plate.style.width = `${active.offsetWidth}px`;
      plate.style.height = `${active.offsetHeight}px`;
      plate.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      plate.style.opacity = "1";
      if (!placed.current) {
        void plate.offsetWidth;
        plate.style.transition = "";
        placed.current = true;
      }
    };

    place();
    // Counts arriving or the group wrapping changes button sizes and positions
    const ro = new ResizeObserver(place);
    group.querySelectorAll("button").forEach((b) => ro.observe(b));
    ro.observe(group);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div ref={groupRef} role="group" aria-label={label} className="relative isolate flex flex-wrap gap-1">
      <span
        ref={plateRef}
        aria-hidden="true"
        className="segment-plate pointer-events-none absolute left-0 top-0 -z-10 rounded-sm bg-note-tint opacity-0 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--note-ink)_26%,transparent)]"
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`btn min-h-9 gap-2 px-3 text-[14px] ${
              active ? "text-note-ink" : "text-ink-2 hover:bg-paper-sunk hover:text-ink"
            }`}
          >
            {o.label}
            {showCounts && o.count !== undefined && (
              <span className={`font-display text-[16px] leading-none tabular transition-colors ${active ? "" : "text-ink-3"}`}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
