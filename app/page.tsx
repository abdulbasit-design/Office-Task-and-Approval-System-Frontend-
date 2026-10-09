import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "@phosphor-icons/react/ssr";
import BrandMark from "@/components/ui/BrandMark";
import Rosette from "@/components/ui/Rosette";
import Seal from "@/components/ui/Seal";
import Serial from "@/components/ui/Serial";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { PriorityBadge, StatusBadge } from "@/components/tasks/TaskStatusBadge";

export const metadata: Metadata = {
  title: "Countersign: every decision, on the record",
  description:
    "Assign work, review what comes back, approve or return it with a reason. Every step stays on the record.",
};

// ── The specimen note: a task rendered as the instrument it becomes ──────────
function SpecimenNote() {
  return (
    <figure className="relative">
      <div className="frame fine-lines relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <Serial id={124} />
          <span className="engraved text-[11px] text-ink-3">Countersign</span>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="font-display text-[26px] leading-[1.15] text-ink sm:text-[30px]">
              Office lease amendment review
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
              <div>
                <dt className="caps text-ink-3">Assigned to</dt>
                <dd className="mt-0.5 text-ink">Tomás Lindqvist</dd>
              </div>
              <div>
                <dt className="caps text-ink-3">Deadline</dt>
                <dd className="mt-0.5 text-ink tabular">14 Oct 2026</dd>
              </div>
              <div>
                <dt className="caps text-ink-3">Priority</dt>
                <dd className="mt-1"><PriorityBadge priority="HIGH" /></dd>
              </div>
              <div>
                <dt className="caps text-ink-3">Status</dt>
                <dd className="mt-1"><StatusBadge status="APPROVED" /></dd>
              </div>
            </dl>
            <blockquote className="mt-5 border-t border-line pt-4 font-display text-[17px] italic leading-snug text-ink-2">
              &ldquo;Open points listed for legal. No change to the break clause.&rdquo;
            </blockquote>
          </div>

          <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56">
            <Rosette seed={124} variant="hero" draw className="absolute inset-0 h-full w-full text-note-ink/70" />
            <div className="absolute -bottom-4 -left-8">
              <Seal seed={124} legend="Countersigned" sub="12 Oct 2026" size={112} press className="[animation-delay:1.9s]" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-[12px] text-ink-3">
          <div className="border-t border-line-strong pt-1.5">Submitted by T. Lindqvist</div>
          <div className="border-t border-line-strong pt-1.5">Countersigned by P. Raman</div>
        </div>

        <div className="mt-4 flex justify-end">
          <Serial id={124} />
        </div>

        {/* Banknote specimens carry this overprint; here it marks the sample data */}
        <span
          aria-hidden="true"
          className="engraved pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] select-none text-[64px] tracking-[0.3em] text-serial/15 sm:text-[84px]"
        >
          Specimen
        </span>
      </div>
      <figcaption className="mt-3 text-[13px] text-ink-3">
        Specimen. An approved task as Countersign records it; names and dates are sample data.
      </figcaption>
    </figure>
  );
}

// ── How a task moves ─────────────────────────────────────────────────────────
const STATIONS = [
  {
    verb: "Assign",
    body: "A manager sets the work, the assignee, a deadline and a priority.",
    states: ["PENDING"] as const,
  },
  {
    verb: "Submit",
    body: "The assignee hands it back with a note on what was done.",
    states: ["SUBMITTED"] as const,
  },
  {
    verb: "Countersign",
    body: "The manager approves it, or returns it with a reason so it can be fixed and resubmitted.",
    states: ["APPROVED", "REJECTED"] as const,
  },
];

// ── Specimen trail: assignee on the left, approver on the right ──────────────
const TRAIL: { side: "assignee" | "approver"; who: string; act: string; quote?: string }[] = [
  { side: "approver", who: "Priya Raman", act: "Created and assigned the task" },
  { side: "assignee", who: "Tomás Lindqvist", act: "Submitted", quote: "First draft of the open points for legal." },
  { side: "approver", who: "Priya Raman", act: "Returned with a reason", quote: "Add the break clause dates." },
  { side: "assignee", who: "Tomás Lindqvist", act: "Resubmitted", quote: "Open points listed for legal. No change to the break clause." },
  { side: "approver", who: "Priya Raman", act: "Approved and countersigned" },
];

// ── Who can do what (from the API's role checks) ─────────────────────────────
const ROLES = ["Employee", "Manager", "Admin"] as const;
const CAPABILITIES: { label: string; roles: (typeof ROLES)[number][] }[] = [
  { label: "Submit assigned work with a note, and resubmit after a return", roles: ["Employee"] },
  { label: "Create, assign and edit tasks with a deadline and priority", roles: ["Manager"] },
  { label: "Approve submissions, or return them with a written reason", roles: ["Manager"] },
  { label: "See every task across the organization", roles: ["Admin"] },
  { label: "Manage people, roles, managers and departments", roles: ["Admin"] },
  { label: "Resolve password reset requests", roles: ["Admin"] },
  { label: "Get notified at every step of their own tasks", roles: ["Employee", "Manager", "Admin"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      {/* ── Nav ── */}
      <header className="border-b border-line">
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Countersign home">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/signup" className="btn btn-ghost hidden sm:inline-flex">Create an account</Link>
            <Link href="/login" className="btn btn-primary">Sign in</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="rise">
            <h1 className="font-display text-[44px] font-medium leading-[1.04] tracking-[-0.01em] text-ink sm:text-[58px] lg:text-[64px]">
              Every decision, countersigned.
            </h1>
            <p className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-ink-2">
              Assign work, review what comes back, approve or return it with a reason. Every step stays on the record.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary min-h-11 px-6 text-[15px]">Sign in</Link>
              <Link href="/signup" className="btn btn-secondary min-h-11 px-6 text-[15px]">Create an account</Link>
            </div>
          </div>
          <SpecimenNote />
        </section>

        {/* ── How a task moves ── */}
        <section aria-labelledby="route-heading" className="border-y border-line bg-paper-raised">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <h2 id="route-heading" className="font-display text-[34px] leading-tight text-ink sm:text-[40px]">
              How a task moves
            </h2>
            <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              <span aria-hidden="true" className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-line-strong md:block" />
              {STATIONS.map((s, i) => (
                <li key={s.verb} className="relative">
                  <span className="relative block h-12 w-12 rounded-full bg-paper-raised text-note-ink">
                    <Rosette seed={300 + i} variant="mark" className="h-12 w-12" />
                  </span>
                  <h3 className="engraved mt-5 text-[20px] text-ink">{s.verb}</h3>
                  <p className="mt-2 max-w-[36ch] text-ink-2">{s.body}</p>
                  <div className="mt-4 flex gap-2">
                    {s.states.map((st) => <StatusBadge key={st} status={st} />)}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── The record ── */}
        <section aria-labelledby="record-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-[60ch]">
            <h2 id="record-heading" className="font-display text-[34px] leading-tight text-ink sm:text-[40px]">
              Nothing happens off the record.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
              Each assignment, submission, approval and return is logged against the person who made it, and everyone involved is notified.
            </p>
          </div>

          <div className="frame mt-12 px-4 py-8 sm:px-10">
            <div className="caps mb-6 grid grid-cols-2 text-ink-3">
              <span>Assignee</span>
              <span className="text-right">Approver</span>
            </div>
            <ol className="relative space-y-5">
              <span aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 border-l border-line-strong" />
              {TRAIL.map((e, i) => (
                <li key={i} className="relative grid grid-cols-2 gap-8">
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border ${
                      e.side === "approver" ? "border-note-ink bg-note-tint" : "border-seal bg-seal-tint"
                    }`}
                  />
                  <div className={e.side === "assignee" ? "pr-4 text-right" : "col-start-2 pl-4"}>
                    <p className="text-[15px] font-semibold text-ink">{e.act}</p>
                    <p className="text-[13px] text-ink-3">{e.who}</p>
                    {e.quote && (
                      <p className="mt-1 font-display text-[16px] italic leading-snug text-ink-2">&ldquo;{e.quote}&rdquo;</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[13px] text-ink-3">Specimen record with sample names.</p>
          </div>
        </section>

        {/* ── Roles ── */}
        <section aria-labelledby="roles-heading" className="border-t border-line bg-paper-raised">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <h2 id="roles-heading" className="font-display text-[34px] leading-tight text-ink sm:text-[40px]">
              Authority follows the role
            </h2>
            <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-ink-2">
              The people who do the work, the people who sign it off, and the people who run the organization each see what is theirs.
            </p>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line-strong">
                    <th scope="col" className="caps py-3 pr-4 text-ink-3 font-semibold">Capability</th>
                    {ROLES.map((r) => (
                      <th key={r} scope="col" className="engraved w-28 py-3 text-center text-[13px] text-ink">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CAPABILITIES.map((c) => (
                    <tr key={c.label} className="border-b border-line last:border-b-0">
                      <th scope="row" className="py-3.5 pr-4 font-normal text-ink">{c.label}</th>
                      {ROLES.map((r) => (
                        <td key={r} className="py-3.5 text-center">
                          {c.roles.includes(r) ? (
                            <Check size={18} weight="bold" className="inline text-note-ink" aria-label="Yes" />
                          ) : (
                            <span className="sr-only">No</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Close ── */}
        <section className="relative overflow-hidden border-t border-line">
          <Rosette
            seed={2026}
            variant="hero"
            className="pointer-events-none absolute -right-40 top-1/2 h-[560px] w-[560px] -translate-y-1/2 text-note-ink/20"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <h2 className="font-display text-[38px] leading-tight text-ink sm:text-[48px]">
              Put your approvals on the record.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary min-h-11 px-6 text-[15px]">Sign in</Link>
              <Link href="/signup" className="btn btn-secondary min-h-11 px-6 text-[15px]">Create an account</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandMark />
          <p>&copy; 2026 Countersign</p>
        </div>
      </footer>
    </div>
  );
}
