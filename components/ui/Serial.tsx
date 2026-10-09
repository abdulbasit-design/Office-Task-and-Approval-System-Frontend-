import React from "react";

/** A task number set like a banknote serial: small-cap "No." and red numbering figures. */
export default function Serial({ id, className = "" }: { id: number; className?: string }) {
  // A caller's display class (e.g. "hidden sm:inline-flex") must win over the default
  const display = /(^|\s)(hidden|inline-flex|flex|block|inline)(\s|$)/.test(className) ? "" : "inline-flex";
  return (
    <span className={`${display} items-baseline gap-1 whitespace-nowrap ${className}`}>
      <span className="caps text-[10px] text-ink-3">No.</span>
      <span className="font-mono text-[13px] font-medium tracking-[0.04em] text-serial tabular">
        {String(id).padStart(6, "0")}
      </span>
    </span>
  );
}
