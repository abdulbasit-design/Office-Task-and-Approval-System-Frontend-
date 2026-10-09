import React from "react";

/**
 * Guilloche rosette generated from a seed (a task id, a user id, a constant).
 * Bands of phase-shifted polar waves weave the lattice; a hypotrochoid star
 * closes the centre. Same seed, same rosette, so a task's seal is its own.
 */

type Variant = "mark" | "seal" | "hero";

const SPEC: Record<Variant, { outer: number; inner: number; perLobe: number }> = {
  mark: { outer: 4, inner: 0, perLobe: 8 },
  seal: { outer: 8, inner: 6, perLobe: 12 },
  hero: { outer: 14, inner: 9, perLobe: 16 },
};

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

function band(lobes: number, rings: number, base: number, amp: number, perLobe: number): string[] {
  const steps = lobes * perLobe;
  const out: string[] = [];
  for (let i = 0; i < rings; i++) {
    const phase = (i / rings) * ((2 * Math.PI) / lobes) * 2;
    let d = "";
    for (let s = 0; s <= steps; s++) {
      const th = (s / steps) * 2 * Math.PI;
      const r = base + amp * Math.sin(lobes * th + phase);
      d += `${s ? "L" : "M"}${f(r * Math.cos(th))} ${f(r * Math.sin(th))}`;
    }
    out.push(d + "Z");
  }
  return out;
}

// Hypotrochoid with an integer ratio closes in a single turn: k + 1 points.
function star(k: number, size: number, depth: number, perLobe: number): string {
  const steps = (k + 1) * perLobe * 2;
  let d = "";
  for (let s = 0; s <= steps; s++) {
    const t = (s / steps) * 2 * Math.PI;
    const x = Math.cos(t) + depth * Math.cos(k * t);
    const y = Math.sin(t) - depth * Math.sin(k * t);
    d += `${s ? "L" : "M"}${f((x * size) / (1 + depth))} ${f((y * size) / (1 + depth))}`;
  }
  return d + "Z";
}

const cache = new Map<string, string[]>();

export function rosettePaths(seed: number, variant: Variant): string[] {
  const key = `${seed}:${variant}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const rand = mulberry32(seed * 7919 + 17);
  const spec = SPEC[variant];
  const outerLobes = 10 + Math.floor(rand() * 10);
  const innerLobes = 6 + Math.floor(rand() * 6);
  const k = 4 + Math.floor(rand() * 5);

  const paths = [
    ...band(outerLobes, spec.outer, 78, 9 + rand() * 6, spec.perLobe),
    ...band(innerLobes, spec.inner, 50, 7 + rand() * 5, spec.perLobe),
    star(k, variant === "mark" ? 52 : 34, 0.55 + rand() * 0.3, spec.perLobe),
  ];
  cache.set(key, paths);
  return paths;
}

interface RosetteProps {
  seed?: number;
  variant?: Variant;
  /** Draw the lines in on mount (reduced motion shows them at once) */
  draw?: boolean;
  className?: string;
  title?: string;
}

export default function Rosette({ seed = 1, variant = "seal", draw = false, className = "", title }: RosetteProps) {
  const paths = rosettePaths(seed, variant);
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={`${draw ? "rosette-draw" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
    >
      <circle r="97" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.55" />
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          strokeWidth={variant === "mark" ? 1 : 0.6}
          vectorEffect="non-scaling-stroke"
          style={draw ? ({ "--i": i } as React.CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}
