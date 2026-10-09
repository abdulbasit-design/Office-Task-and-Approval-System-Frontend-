import React from "react";
import Link from "next/link";
import type { TaskResponse } from "@/lib/api/taskApi";
import { StatusBadge } from "@/components/tasks/TaskStatusBadge";
import Rosette from "@/components/ui/Rosette";
import { formatDate } from "@/lib/format";

const ORDER: TaskResponse["status"][] = ["SUBMITTED", "PENDING", "REJECTED", "APPROVED"];

/** Status counts set as a ledger: dotted leaders, a double-ruled total. */
export function Register({ tasks }: { tasks: TaskResponse[] }) {
  const count = (s: TaskResponse["status"]) => tasks.filter((t) => t.status === s).length;
  return (
    <section aria-labelledby="register-heading" className="panel px-5 pb-4 pt-5">
      <h2 id="register-heading" className="font-display text-[20px] leading-tight text-ink">Register</h2>
      <ul className="mt-4 space-y-1">
        {ORDER.map((s) => (
          <li key={s}>
            <Link
              href={`/tasks?status=${s}`}
              className="-mx-2 flex items-center gap-3 rounded-sm px-2 py-1.5 transition-colors hover:bg-paper-sunk"
            >
              <StatusBadge status={s} />
              <span aria-hidden="true" className="h-0 flex-1 translate-y-1 border-b border-dotted border-line-strong" />
              <span className="font-display text-[22px] leading-none text-ink tabular">{count(s)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t-[3px] border-double border-line-strong pt-3">
        <span className="caps text-ink-3">Total</span>
        <span className="font-display text-[22px] leading-none text-ink tabular">{tasks.length}</span>
      </div>
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
                <Rosette seed={t.id} variant="mark" className="h-9 w-9 shrink-0 text-seal" />
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
