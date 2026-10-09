"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import CloseOnEscape from "@/components/ui/CloseOnEscape";
import { dueLabel } from "@/lib/format";

// Values are local "YYYY-MM-DDTHH:mm", the same shape <input type="datetime-local"> uses.

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, h) => pad(h));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));
const ROW = 36; // drum row height in px, matches h-9

/** Six Monday-first weeks covering the month that contains `month`. */
function monthGrid(month: Date) {
  const first = firstOfMonth(month);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function quickPicks(today: Date) {
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  return [
    { label: "Tomorrow", date: addDays(today, 1) },
    {
      label: "End of week",
      date: addDays(today, dow < 4 ? 4 - dow : 11 - dow),
    },
    { label: "Next week", date: addDays(today, 7 - dow) },
    { label: "In two weeks", date: addDays(today, 14) },
  ];
}

/** Keep any off-grid value (e.g. 22:37 from older data) so editing never loses it. */
const withValue = (list: string[], v: string) =>
  list.includes(v) ? list : [...list, v].sort();

/**
 * A numbering-press drum: values roll past a fixed window and snap into it.
 * The curvature is a scroll-driven animation in CSS, so rolling costs no JS per frame.
 */
function Drum({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const target = useRef<number | null>(null);
  const index = Math.max(0, values.indexOf(value));

  // Sit on the value whenever it changes from outside (and on first paint)
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollTop - index * ROW) > 2)
      el.scrollTop = index * ROW;
  }, [index]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const roll = (i: number) => {
    const next = Math.min(values.length - 1, Math.max(0, i));
    target.current = next;
    ref.current?.scrollTo({
      top: next * ROW,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  // When the drum comes to rest, the value in the window is the value
  const onScroll = () => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      target.current = null;
      const v =
        values[
          Math.min(
            values.length - 1,
            Math.max(0, Math.round(el.scrollTop / ROW)),
          )
        ];
      if (v !== value) onChange(v);
    }, 110);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowUp: -1,
      ArrowDown: 1,
      PageUp: -4,
      PageDown: 4,
    };
    const from = target.current ?? index;
    if (e.key in steps) roll(from + steps[e.key]);
    else if (e.key === "Home") roll(0);
    else if (e.key === "End") roll(values.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="relative rounded-sm outline-offset-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-note-ink has-[:focus-visible]:[outline-style:solid]">
      {/* The window the chosen value prints in */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 border-y border-line-strong bg-note-tint"
      />
      <div
        ref={ref}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={Number(value)}
        aria-valuetext={value}
        aria-valuemin={Number(values[0])}
        aria-valuemax={Number(values[values.length - 1])}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        className="drum relative h-[108px] w-[4.25rem] snap-y snap-mandatory overflow-y-auto overscroll-contain py-9 focus-visible:outline-none"
      >
        {values.map((v, i) => (
          <div
            key={v}
            onClick={() => roll(i)}
            className="drum-cell flex h-9 cursor-pointer snap-center items-center justify-center font-mono text-[22px] font-medium tabular text-ink"
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DeadlinePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Deadline as a dating press: quick picks, a ledger calendar whose pages turn
 * and whose chosen day is stamped in ink, and numbering drums for the time.
 */
export default function DeadlinePicker({
  id,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: DeadlinePickerProps) {
  const [datePart = "", timePart = "17:00"] = value ? value.split("T") : [];
  const [hour = "17", minute = "00"] = timePart.split(":");

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() =>
    firstOfMonth(datePart ? fromYmd(datePart) : new Date()),
  );
  const [turn, setTurn] = useState<"next" | "prev" | null>(null);
  const [cursor, setCursor] = useState(datePart);
  const [stamped, setStamped] = useState<string | null>(null);
  const [placeUp, setPlaceUp] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayYmd = ymd(today);
  const chosen = datePart ? new Date(value) : null;

  const commit = (d: string, h = hour, m = minute) =>
    onChange(`${d}T${h}:${m}`);

  const showMonth = (d: Date) => {
    const delta = monthIndex(d) - monthIndex(month);
    if (!delta) return;
    setTurn(delta > 0 ? "next" : "prev");
    setMonth(firstOfMonth(d));
  };

  const openPicker = () => {
    setMonth(firstOfMonth(datePart ? fromYmd(datePart) : today));
    setTurn(null);
    setCursor(datePart || todayYmd);
    setStamped(null);
    // Open upward when the slip (about 380px) would run past the bottom of the window
    const r = triggerRef.current?.getBoundingClientRect();
    const below = r ? window.innerHeight - r.bottom : Infinity;
    setPlaceUp(Boolean(r) && below < 400 && (r?.top ?? 0) > below);
    setOpen(true);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const pickDay = (d: Date) => {
    const key = ymd(d);
    setCursor(key);
    setStamped(key);
    showMonth(d);
    commit(key);
  };

  // Close on an outside press
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // If neither side has room, bring the whole slip into view (phones use a fixed sheet instead)
  useEffect(() => {
    const panel = panelRef.current;
    if (open && panel && getComputedStyle(panel).position !== "fixed")
      panel.scrollIntoView({
        block: "nearest",
        behavior: reducedMotion() ? "auto" : "smooth",
      });
  }, [open]);

  // Keyboard focus follows the cursor day
  useEffect(() => {
    if (open)
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${cursor}"]`)
        ?.focus({ preventScroll: true });
  }, [open, cursor]);

  const onGridKey = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const c = fromYmd(cursor || todayYmd);
    let next: Date | undefined;
    if (e.key in steps) next = addDays(c, steps[e.key]);
    else if (e.key === "PageUp" || e.key === "PageDown")
      next = new Date(
        c.getFullYear(),
        c.getMonth() + (e.key === "PageDown" ? 1 : -1),
        c.getDate(),
      );
    if (!next) return;
    e.preventDefault();
    if (ymd(next) < todayYmd) return;
    setCursor(ymd(next));
    showMonth(next);
  };

  const days = monthGrid(month);
  const monthLabel = month.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  // One tab stop in the grid: the cursor day if it is on this page, else the first open day
  const tabStop = days.some((d) => ymd(d) === cursor)
    ? cursor
    : ymd(
        days.find(
          (d) => d.getMonth() === month.getMonth() && ymd(d) >= todayYmd,
        ) ?? month,
      );
  const inPast = chosen ? chosen < today : false;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        className={`input flex items-center gap-2.5 text-left ${invalid ? "border-serial" : ""}`}
      >
        <CalendarBlank
          size={17}
          aria-hidden="true"
          className="shrink-0 text-ink-3"
        />
        {chosen ? (
          <span
            key={value}
            className="rise flex min-w-0 flex-1 items-baseline gap-2"
          >
            <span className="truncate text-ink">
              {chosen.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="tabular text-ink-2">
              {hour}:{minute}
            </span>
          </span>
        ) : (
          <span className="flex-1 text-ink-3">Choose a deadline</span>
        )}
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden="true"
          className={`shrink-0 text-ink-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Phones: the slip is a bottom sheet over a light scrim */}
          <div
            aria-hidden="true"
            onClick={() => close(true)}
            className="fixed inset-0 z-40 bg-ink/30 sm:hidden"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choose a deadline"
            data-place={placeUp ? "up" : "down"}
            className={`picker fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto border-t border-line-strong bg-paper-raised shadow-[0_-20px_50px_-20px_rgb(var(--shadow-color)/0.45)] sm:absolute sm:inset-x-auto sm:left-0 sm:max-h-none sm:w-[34.5rem] sm:overflow-hidden sm:rounded-sm sm:border sm:border-line sm:shadow-[0_20px_50px_-20px_rgb(var(--shadow-color)/0.45)] ${
              placeUp
                ? "sm:bottom-full sm:mb-2"
                : "sm:bottom-auto sm:top-full sm:mt-2"
            }`}
          >
            <CloseOnEscape onClose={() => close(true)} />

            {/* Wider screens: calendar left; quick picks over the time drums on the right */}
            <div className="grid sm:grid-cols-[18.75rem_1fr]">
              {/* Quick picks keep the chosen time */}
              <div className="grid grid-cols-2 gap-1.5 p-2 sm:col-start-2 sm:row-start-1 sm:grid-cols-1 sm:gap-1 sm:border-l sm:border-line sm:p-2.5">
                {quickPicks(today).map((q, i) => {
                  const key = ymd(q.date);
                  const on = key === datePart;
                  return (
                    <button
                      key={q.label}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickDay(q.date)}
                      style={{ "--i": i } as React.CSSProperties}
                      className={`rise flex flex-col items-start rounded-sm border px-2.5 py-1.5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-2 ${
                        on
                          ? "border-note-ink/40 bg-note-tint"
                          : "border-line hover:border-line-strong hover:bg-paper-sunk"
                      }`}
                    >
                      <span className="text-[13px] font-semibold text-ink">
                        {q.label}
                      </span>
                      <span className="text-[12px] text-ink-3 tabular">
                        {q.date.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-line sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:border-t-0">
                {/* Month band, hatched like the note's ground */}
                <div className="fine-lines flex items-center justify-between border-b border-line px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      showMonth(
                        new Date(month.getFullYear(), month.getMonth() - 1, 1),
                      )
                    }
                    disabled={monthIndex(month) <= monthIndex(today)}
                    aria-label="Previous month"
                    className="btn btn-ghost w-8 min-h-8 px-0"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <p
                    key={monthIndex(month)}
                    className="rise engraved text-[15px] text-ink"
                    aria-live="polite"
                  >
                    {monthLabel}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      showMonth(
                        new Date(month.getFullYear(), month.getMonth() + 1, 1),
                      )
                    }
                    aria-label="Next month"
                    className="btn btn-ghost w-8 min-h-8 px-0"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>

                <div
                  className="grid grid-cols-7 gap-0.5 px-2 pb-1 pt-2"
                  aria-hidden="true"
                >
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="caps text-center text-ink-3">
                      {w}
                    </span>
                  ))}
                </div>

                {/* The page turns toward the month you are heading for */}
                <div
                  key={monthIndex(month)}
                  ref={gridRef}
                  role="group"
                  aria-label={monthLabel}
                  onKeyDown={onGridKey}
                  className={`grid grid-cols-7 gap-0.5 px-2 pb-2 ${turn === "next" ? "page-next" : turn === "prev" ? "page-prev" : ""}`}
                >
                  {days.map((d) => {
                    const key = ymd(d);
                    const inMonth = d.getMonth() === month.getMonth();
                    const past = key < todayYmd;
                    const selected = key === datePart;
                    const isToday = key === todayYmd;
                    const weekend = d.getDay() % 6 === 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        data-day={key}
                        disabled={past}
                        tabIndex={key === tabStop ? 0 : -1}
                        aria-pressed={selected}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={d.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        onClick={() => pickDay(d)}
                        className={`relative flex h-9 items-center justify-center rounded-sm font-display text-[16px] tabular transition-colors ${
                          past
                            ? "text-line-strong"
                            : selected
                              ? "text-on-note"
                              : `hover:bg-paper-sunk ${inMonth ? (weekend ? "text-ink-3" : "text-ink") : "text-ink-3/50"}`
                        }`}
                      >
                        {selected && (
                          <span
                            aria-hidden="true"
                            className={`absolute inset-[3px] rounded-sm bg-note ${stamped === key ? "ink-stamp" : ""}`}
                          />
                        )}
                        <span className="relative">{d.getDate()}</span>
                        {isToday && (
                          <span
                            aria-hidden="true"
                            className={`absolute bottom-[5px] left-1/2 h-px w-3 -translate-x-1/2 ${selected ? "bg-on-note" : "bg-note-ink"}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time on numbering drums */}
              <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 sm:col-start-2 sm:row-start-2 sm:border-l sm:px-3 sm:py-2.5">
                <div>
                  <p className="caps text-ink-3">Time</p>
                  <p className="mt-1 max-w-[12ch] text-[12px] leading-snug text-ink-3 sm:hidden">
                    Scroll, drag or use the arrow keys
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Drum
                    label="Hour"
                    values={withValue(HOURS, hour)}
                    value={hour}
                    onChange={(h) =>
                      commit(datePart || cursor || todayYmd, h, minute)
                    }
                  />
                  <span
                    aria-hidden="true"
                    className="font-mono text-[22px] text-ink-3"
                  >
                    :
                  </span>
                  <Drum
                    label="Minute"
                    values={withValue(MINUTES, minute)}
                    value={minute}
                    onChange={(m) =>
                      commit(datePart || cursor || todayYmd, hour, m)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-sunk px-3 py-2.5">
              <p
                className="min-w-0 text-[13px] leading-snug"
                aria-live="polite"
              >
                {chosen ? (
                  <>
                    <span className="block font-semibold text-ink">
                      {chosen.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                      ,{" "}
                      <span className="tabular">
                        {hour}:{minute}
                      </span>
                    </span>
                    <span
                      className={`block ${inPast ? "text-serial" : "text-ink-3"}`}
                    >
                      {inPast
                        ? "That time has already passed"
                        : dueLabel(value).text}
                    </span>
                  </>
                ) : (
                  <span className="text-ink-3">
                    Pick a day, then roll the time.
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() => close(true)}
                className="btn btn-primary min-h-9 shrink-0 px-4"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
