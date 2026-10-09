import React from "react";
import Rosette from "./Rosette";

interface SealProps {
  seed: number;
  /** Text engraved around the ring, e.g. "Countersigned" */
  legend: string;
  /** Short line under the legend inside the ring, e.g. a date */
  sub?: string;
  size?: number;
  tone?: "seal" | "serial";
  press?: boolean;
  className?: string;
}

/** The task's own rosette inside an engraved ring: printed on approval, cancelled on rejection. */
export default function Seal({ seed, legend, sub, size = 132, tone = "seal", press = false, className = "" }: SealProps) {
  const id = `seal-ring-${seed}-${tone}`;
  const ring = `${legend.toUpperCase()} • ${sub ? sub.toUpperCase() + " • " : ""}`;
  return (
    <div
      className={`relative shrink-0 ${tone === "seal" ? "text-seal" : "text-serial"} ${press ? "seal-press" : ""} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={sub ? `${legend}, ${sub}` : legend}
    >
      <Rosette seed={seed} variant="seal" className="absolute inset-[17%] w-[66%] h-[66%]" />
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <circle r="97" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle r="70" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path id={id} d="M0,-83 a83,83 0 1,1 -0.01,0" fill="none" />
        <text
          fill="currentColor"
          style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, letterSpacing: "0.22em", fontStretch: "88%" }}
        >
          <textPath href={`#${id}`} textLength={505} lengthAdjust="spacing">
            {ring.repeat(sub ? 1 : 2)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
