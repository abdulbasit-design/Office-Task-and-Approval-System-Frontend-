import React from "react";
import Rosette from "./Rosette";

/** Countersign's mark: the house rosette beside the engraved wordmark. */
export default function BrandMark({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Rosette seed={1926} variant="mark" className="w-8 h-8 text-note-ink shrink-0" />
      {!compact && <span className="engraved text-[17px] leading-none text-ink collapsed:hidden">Countersign</span>}
    </span>
  );
}
