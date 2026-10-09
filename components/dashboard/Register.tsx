import React from "react";
import Link from "next/link";
import type { TaskResponse } from "@/lib/api/taskApi";
import { StatusBadge } from "@/components/tasks/TaskStatusBadge";
import Rosette from "@/components/ui/Rosette";
import { formatDate } from "@/lib/format";
import CountUp from "@/components/ui/CountUp";

const ORDER: TaskResponse["status"][] = ["SUBMITTED", "PENDING", "REJECTED", "APPROVED"];

/** Status counts as one denomination strip: double-ruled top and bottom, hairlines between, total last. */
export function Register({ tasks }: { tasks: TaskResponse[] }) {
  const count = (s: TaskResponse["status"]) => tasks.filter((t) => t.status === s).length;
  return (
    <section aria-label="Register">
      <ul className="grid grid-cols-2 border-y-[3px] border-double border-line-strong sm:grid-cols-5" role="list">
        {ORDER.map((s, i) => (
          <li
            key={s}
            className="rise border-line max-sm:odd:border-r max-sm:[&:nth-child(n+3)]:border-t sm:border-r"
            style={{ "--i": i } as React.CSSProperties}
          >
            <Link
              href={`/tasks?status=${s}`}
              className="group flex h-full flex-col items-start gap-2 px-4 py-3 transition-colors hover:bg-paper-sunk"
            >
              <StatusBadge status={s} />
              <CountUp value={count(s)} className="nudge font-display text-[34px] leading-none text-ink tabular" />
            </Link>
          </li>
        ))}
        <li className="rise col-span-2 flex items-end justify-between gap-2 border-t border-line px-4 py-3 sm:col-span-1 sm:flex-col sm:items-start sm:justify-between sm:border-t-0" style={{ "--i": ORDER.length } as React.CSSProperties}>
          <span className="caps flex h-6 items-center text-ink-3">Total</span>
          <CountUp value={tasks.length} className="font-display text-[34px] leading-none text-ink-2 tabular" />
        </li>
      </ul>
    </section>
  );
}

/** The last few approvals, each with its own seal. */
export function RecentlySealed({ tasks }: { tasks: TaskResponse[] }) {
  const sealed = tasks
    .filter((t) => t.status === "APPROVED")
    .sort((a, b) => new Date(b.approved_at ?? 0).getTime() - new Date(a.approved_at ?? 0).getTime())
    .slice(0, 4);

  return (
    <section aria-labelledby="sealed-heading" className="panel px-5 pb-2 pt-5">
      <h2 id="sealed-heading" className="font-display text-[20px] leading-tight text-ink">Recently sealed</h2>
      {sealed.length === 0 ? (
        <p className="py-4 text-[14px] text-ink-3">Approved tasks will be sealed here.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {sealed.map((t) => (
            <li key={t.id}>
              <Link href={`/tasks/${t.id}`} className="group flex items-center gap-3 py-3">
                <Rosette seed={t.id} variant="mark" className="lathe-hover h-9 w-9 shrink-0 text-seal" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-ink group-hover:text-note-ink">{t.title}</span>
                  <span className="block text-[12px] text-ink-3 tabular">
                    Countersigned {formatDate(t.approved_at)}
                    {t.approved_by_name ? ` by ${t.approved_by_name}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
