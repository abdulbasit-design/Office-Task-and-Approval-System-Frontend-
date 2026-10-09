"use client";

import React, { useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

/**
 * Refetch a list. The arrow turns while the request runs and always finishes
 * on a whole turn, so even an instant response reads as one clean revolution.
 * Under reduced motion it does not turn; the label alone says "Refreshing...".
 */
export default function RefreshButton({ onRefresh, fetching }: { onRefresh: () => void; fetching: boolean }) {
  const [turning, setTurning] = useState(false);
  const busy = turning || fetching;

  return (
    <button
      type="button"
      onClick={() => {
        if (busy) return;
        setTurning(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        onRefresh();
      }}
      aria-disabled={busy}
      className={`btn btn-secondary min-h-9 shrink-0 px-3 ${busy ? "cursor-progress" : ""}`}
    >
      <ArrowClockwise
        size={17}
        aria-hidden="true"
        className={turning ? "refresh-turn" : ""}
        onAnimationIteration={() => !fetching && setTurning(false)}
      />
      {/* Both labels share one cell, so the button never changes width */}
      <span className="grid justify-items-center">
        <span className={`col-start-1 row-start-1 ${busy ? "invisible" : ""}`}>Refresh</span>
        <span className={`col-start-1 row-start-1 ${busy ? "" : "invisible"}`} aria-hidden={!busy}>Refreshing...</span>
      </span>
    </button>
  );
}
