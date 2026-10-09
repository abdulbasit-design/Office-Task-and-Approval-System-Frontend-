import React from "react";
import Rosette from "./Rosette";

/** Countersign's mark: the house rosette beside the engraved wordmark. */
export default function BrandMark({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <Rosette seed={1926} variant="mark" className="lathe-hover w-8 h-8 text-note-ink shrink-0" />
      {!compact && (
        <span className="fold-label engraved whitespace-nowrap text-[17px] leading-none text-ink">Countersign</span>
      )}
    </span>
  );
}
