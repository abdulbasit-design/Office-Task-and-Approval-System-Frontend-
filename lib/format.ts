/** Date formatting shared by task surfaces. Dates read "12 Oct 2026". */

const DAY = 86_400_000;

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${formatDate(iso)}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/** "Due today", "Due in 3 days", "Overdue by 2 days", by calendar day. */
export function dueLabel(iso: string, now = new Date()): { text: string; overdue: boolean; soon: boolean } {
  const due = new Date(iso);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(due) - startOf(now)) / DAY);
  if (days < 0) return { text: `Overdue by ${-days} day${days === -1 ? "" : "s"}`, overdue: true, soon: false };
  if (days === 0) return { text: "Due today", overdue: false, soon: true };
  if (days === 1) return { text: "Due tomorrow", overdue: false, soon: true };
  return { text: `Due in ${days} days`, overdue: false, soon: days <= 3 };
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
