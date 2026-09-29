import React from "react";

export type StatAccentColor = "blue" | "amber" | "indigo" | "emerald";

export interface StatCardProps {
  title: string;
  value: number | string;
  change?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon: React.ReactNode;
  accentColor?: StatAccentColor;
  description?: string;
}

const colorStyles: Record<
  StatAccentColor,
  {
    bgIcon: string;
    textIcon: string;
    borderIcon: string;
    highlight: string;
  }
> = {
  blue: {
    bgIcon: "bg-blue-50",
    textIcon: "text-blue-600",
    borderIcon: "border-blue-100",
    highlight: "from-blue-500/10 to-transparent",
  },
  amber: {
    bgIcon: "bg-amber-50",
    textIcon: "text-amber-600",
    borderIcon: "border-amber-100",
    highlight: "from-amber-500/10 to-transparent",
  },
  indigo: {
    bgIcon: "bg-indigo-50",
    textIcon: "text-indigo-600",
    borderIcon: "border-indigo-100",
    highlight: "from-indigo-500/10 to-transparent",
  },
  emerald: {
    bgIcon: "bg-emerald-50",
    textIcon: "text-emerald-600",
    borderIcon: "border-emerald-100",
    highlight: "from-emerald-500/10 to-transparent",
  },
};

export default function StatCard({
  title,
  value,
  change,
  icon,
  accentColor = "blue",
  description,
}: StatCardProps) {
  const currentStyles = colorStyles[accentColor] || colorStyles.blue;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all duration-200 hover:shadow-md hover:border-slate-300 group">
      {/* Subtle top corner gradient accent */}
      <div
        className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${currentStyles.highlight} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {/* Icon Squircle matching the brand visual style */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${currentStyles.bgIcon} ${currentStyles.textIcon} ${currentStyles.borderIcon} shadow-xs shrink-0`}
        >
          {icon}
        </div>
      </div>

      {/* Footer / Trend or Description */}
      {(change || description) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
                  change.isPositive !== false
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-rose-700 bg-rose-50"
                }`}
              >
                {change.isPositive !== false ? "↑" : "↓"} {change.value}
              </span>
              {change.label && (
                <span className="text-slate-500">{change.label}</span>
              )}
            </div>
          )}

          {description && !change && (
            <span className="text-slate-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
