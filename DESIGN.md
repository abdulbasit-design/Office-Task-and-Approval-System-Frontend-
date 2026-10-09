---
name: Countersign
description: Every decision, countersigned. An office task and approval system set as an engraved treasury note.
colors:
  paper: "light-dark(#f3f3f2, #111214)"
  paper-raised: "light-dark(#fbfbfa, #18191c)"
  paper-sunk: "light-dark(#e8e8e6, #0b0c0d)"
  ink: "light-dark(#17191c, #e8e8e6)"
  ink-2: "light-dark(#44474d, #abadb2)"
  ink-3: "light-dark(#62666d, #878a91)"
  line: "light-dark(#d6d6d3, #2a2c30)"
  line-strong: "light-dark(#a3a5a8, #484b51)"
  note: "light-dark(#1f2328, #e8e8e6)"
  note-deep: "light-dark(#0b0d10, #f7f7f6)"
  note-ink: "light-dark(#1f2328, #e8e8e6)"
  note-tint: "light-dark(#e2e2df, #26282c)"
  on-note: "light-dark(#fafaf9, #141518)"
  seal: "light-dark(#a47e3b, #c9a35a)"
  seal-ink: "light-dark(#7a5a1f, #d8b56e)"
  seal-tint: "light-dark(#f1e8d6, #2b2416)"
  serial: "light-dark(#b42318, #f07b6e)"
  serial-fill: "light-dark(#b42318, #c4382c)"
  serial-tint: "light-dark(#f7e4e1, #351612)"
  ok: "light-dark(#2f6b4f, #7fc4a0)"
  ok-tint: "light-dark(#e1ece5, #15291f)"
typography:
  display:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "64px"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.01em"
    fontVariation: "'opsz' 11"
  headline:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.25
    fontVariation: "'opsz' 11"
  title-page:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.12
    fontVariation: "'opsz' 11"
  title:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.25
    fontVariation: "'opsz' 11"
  figure:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "'tnum', 'lnum'"
    fontVariation: "'opsz' 11"
  quote:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.375
    fontVariation: "'opsz' 11"
  engraved:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.06em"
    fontVariation: "'opsz' 11"
  lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'kern', 'liga'"
  body-sm:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "0.01em"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.12em"
    fontVariation: "'wdth' 88"
  serial:
    fontFamily: "Azeret Mono, monospace"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0.04em"
    fontFeature: "'tnum', 'lnum'"
rounded:
  xs: "1px"
  sm: "2px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  gutter-lg: "32px"
  row: "16px"
  panel: "20px"
  stack: "24px"
  stack-lg: "32px"
  section: "80px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.note}"
    textColor: "{colors.on-note}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.note-deep}"
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-sunk}"
  button-ghost:
    textColor: "{colors.ink-2}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink}"
  button-danger:
    textColor: "{colors.serial}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-danger-hover:
    backgroundColor: "{colors.serial-fill}"
    textColor: "#ffffff"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  input-disabled:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink-3}"
  panel:
    backgroundColor: "{colors.paper-raised}"
    rounded: "{rounded.sm}"
    padding: "20px"
  frame:
    backgroundColor: "{colors.paper-raised}"
    padding: "28px 36px"
  status-pending:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  status-submitted:
    backgroundColor: "{colors.seal-tint}"
    textColor: "{colors.seal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  status-approved:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  status-rejected:
    backgroundColor: "{colors.serial-tint}"
    textColor: "{colors.serial}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  role-admin:
    backgroundColor: "{colors.note}"
    textColor: "{colors.on-note}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  role-manager:
    backgroundColor: "{colors.note-tint}"
    textColor: "{colors.note-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  role-employee:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  nav-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.note-tint}"
    textColor: "{colors.note-ink}"
  serial:
    textColor: "{colors.serial}"
    typography: "{typography.serial}"
  avatar:
    backgroundColor: "{colors.note-tint}"
    textColor: "{colors.note-ink}"
    rounded: "{rounded.full}"
    size: "32px"
  unread-count:
    backgroundColor: "{colors.serial-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    height: "17px"
---

# Design System: Countersign

## Overview

**Creative North Star: "The Treasury Note"**

Every task in Countersign is treated as a note of value: it is numbered, engraved, and countersigned. The interface is printed on neutral grey security paper in charcoal intaglio ink. Three special inks are held back for meaning: bronze foil for seals and work awaiting a countersignature, green for approval, and numbering red for serials and anything that went wrong. Structure comes from engraved rules and hairlines rather than from cards, tinted tiles, or pill badges. The deliberate rejection, written into the direction contract, is the slate-card SaaS dashboard of stat tiles and pill badges.

The density is that of a well-kept register. Rows are compact, figures are tabular, labels are small caps, and headings are set in Bodoni Moda as if engraved. Ornament is generated rather than drawn: every brand surface, empty state and seal uses a guilloche rosette computed from a seed (a task id, a user id, a constant), so a task's seal belongs to that task alone. Motion is printing motion: rosette lines draw in, seals press, statuses stamp, and the theme washes across the page along the hatching angle (118deg), all of it only when the viewer has not asked for reduced motion.

Light and dark are one system. Every colour token is a single `light-dark()` declaration. `html[data-theme]` pins light or dark, and when it is absent the OS decides. In dark mode the charcoal ink inverts to pale paper-white ink, so primary buttons become light on dark rather than taking on a new hue.

**Key Characteristics:**
- Neutral grey paper grounds (never cream) with charcoal ink for text and primary actions.
- Bronze, green and red are status inks with fixed meanings, never decoration.
- One corner language: 2px, square-feeling frames, circles only for avatars, seals and counts.
- Bodoni Moda engraved display, Archivo text with a narrowed width for caps, Azeret Mono serials.
- Generated guilloche rosettes and seals instead of illustration or icon art.
- Printing motion (draw, press, stamp, wash), always behind `prefers-reduced-motion: no-preference`.

## Colors

A monochrome charcoal-on-grey note with three reserved inks: bronze foil, approval green, and numbering red. Values below are light / dark.

### Primary
- **Charcoal Intaglio** (`--note` #1f2328 / #e8e8e6): fills of primary buttons and the solid Admin role stamp. Its hover deepens to **Engraver's Black** (`--note-deep` #0b0d10 / #f7f7f6). Text on it is **Note White** (`--on-note` #fafaf9 / #141518).
- **Charcoal Link Ink** (`--note-ink` #1f2328 / #e8e8e6): links, the focus ring, the caret, the active nav item, avatar initials, the BrandMark rosette, role checkmarks, the assigned notification icon, and the Manager role badge. It shares its value with `--note` but is the token for ink on paper, not for fills.
- **Pressed Charcoal Tint** (`--note-tint` #e2e2df / #26282c): grounds for the active nav item, avatars, and the Manager role badge.

### Secondary
Bronze has exactly two meanings: a seal, and the SUBMITTED state.
- **Bronze Foil** (`--seal` #a47e3b / #c9a35a): seals. This covers the Seal component, the seal rosettes in "Recently sealed", the filled approved marker on the activity trail, and the approved notification icon. It is also the border of the Submitted badge.
- **Bronze Ink** (`--seal-ink` #7a5a1f / #d8b56e): text of the Submitted badge and the submitted and resubmitted notification icons.
- **Foil Tint** (`--seal-tint` #f1e8d6 / #2b2416): the Submitted badge ground, the assignee submission markers on the activity trail and the landing specimen trail, and `::selection`.

### Tertiary
- **Numbering Red** (`--serial` #b42318 / #f07b6e): serial numbers, overdue labels, rejection badges and quoted rejection reasons, High priority, the outline danger button, field errors and `aria-invalid` borders, and the "Sign out" menu item.
- **Numbering Red Fill** (`--serial-fill` #b42318 / #c4382c): solid red under white text. Used for the unread count, danger buttons on hover or focus, and the reject-confirm button.
- **Red Tint** (`--serial-tint` #f7e4e1 / #351612): grounds for the Rejected badge, error notes, the rejection block on a task, and the sign-out hover.
- **Approval Green** (`--ok` #2f6b4f / #7fc4a0): the Approved badge, the user Active marker, and success confirmations ("Changes saved.", reset sent, the password length hint once it is met).
- **Approval Tint** (`--ok-tint` #e1ece5 / #15291f): grounds for the Approved badge and success notes.

### Neutral
- **Security Paper** (`--paper` #f3f3f2 / #111214): the page ground, the header, and the `html` background.
- **Raised Sheet** (`--paper-raised` #fbfbfa / #18191c): panels, frames, inputs, the sidebar, menus, and alternate landing bands.
- **Sunk Plate** (`--paper-sunk` #e8e8e6 / #0b0c0d): hover grounds, table heads, skeletons, disabled inputs, and the Pending badge.
- **Ink** (`--ink` #17191c / #e8e8e6): body text and headings.
- **Ink 2** (`--ink-2` #44474d / #abadb2): secondary text, ghost buttons, inactive nav items, the Pending and Employee badges, and Medium priority.
- **Ink 3** (`--ink-3` #62666d / #878a91): metadata, caps labels, placeholders, and Low priority. Empty-state rosettes are drawn in `--line-strong` instead.
- **Hairline** (`--line` #d6d6d3 / #2a2c30): dividers, panel borders, and the inner rule of a frame.
- **Strong Rule** (`--line-strong` #a3a5a8 / #484b51): frame outer border, input borders, the double rules of the Register, trail spines, and scrollbars.
- **Shadow colour** (`--shadow-color` RGB triplet `23 25 28` / `0 0 0`): used only as `rgb(var(--shadow-color) / a)` inside shadows.

### Named Rules
**The Reserved Ink Rule.** Bronze means "a seal" or "submitted, awaiting countersignature", and nothing else. That excludes roles, priority, links and decoration. Green means "approved, active, or done". Numbering red means "a serial, overdue, rejected, High priority, an error, destructive, or unread". Nothing else may use these three families, and no fourth accent exists.

**The Authority Is Ink Weight Rule.** Rank is shown by how much charcoal is printed, not by hue. Admin is a solid ink stamp, Manager is a charcoal tint, and Employee is neutral paper. Priority works the same way: High is the only priority in colour (red), Medium is `--ink-2`, and Low is `--ink-3`.

**The Grey Paper Rule.** Grounds are neutral grey with no warm cast. Do not tint the paper toward cream or ivory. Warmth belongs to the bronze foil alone.

**The Charcoal Action Rule.** Primary actions are charcoal (`--note`), never bronze or red. In dark mode they invert to pale ink on a dark ground.

## Typography

**Display Font:** Bodoni Moda (via `next/font`, variable `--font-bodoni`, `opsz` axis, normal and italic)
**Body Font:** Archivo (variable `--font-archivo`, `wdth` axis), falling back to system-ui, sans-serif
**Label/Mono Font:** Azeret Mono (variable `--font-azeret`) for serials and counts

**Character:** a high-contrast Didone engraved over a sturdy, slightly narrow grotesque, like a banknote's title over its fine print. Mono numerals act as the numbering press.

Bodoni Moda is pinned to its text optical master (`font-variation-settings: "opsz" 11`) on `.font-display` and `.engraved`. The large master mis-spaces v and y, and the text master's sturdier hairlines read as engraving. The body is 15px / 1.55 with `kern` and `liga`. Tables, `<time>` and `.tabular` use `tabular-nums lining-nums`.

### Hierarchy
- **Display** (Bodoni 500, 44px → 58px at sm → 64px at lg, line-height 1.04, -0.01em): the landing hero line only.
- **Headline** (Bodoni 400, 34px → 40px at sm, line-height 1.25): landing section headings. The closing band uses 38px → 48px.
- **Page title** (Bodoni 400, 30px → 36px, line-height 1.12): task titles on the note, the dashboard greeting (32px → 36px), auth form headings, and profile names (30px).
- **Title** (Bodoni 400, 22px, line-height 1.25): panel and section headings ("Your decision", "The record"). Queue headings are 24px when primary and 20px when secondary. The header page title is 20px → 24px. Dialog titles are 24px.
- **Figure** (Bodoni 400, 34px, line-height 1, tabular): Register counts. Queue counts use 22px in `--ink-3`.
- **Quote** (Bodoni italic, 15–19px, line-height 1.375): submission notes, rejection reasons and trail quotes, always in curly quotes. Rejection quotes are set in `--serial`.
- **Engraved** (Bodoni 500, uppercase, 0.06em): the wordmark (17px), landing station verbs (20px), role names (12–13px), and the specimen overprint.
- **Lead** (Archivo 400, 17px, line-height 1.625, max 34–60ch): landing intro paragraphs.
- **Body** (Archivo 400, 15px, line-height 1.55, max 65ch for long text): the default. Task briefs, meta values, inputs.
- **Body small** (Archivo, 14px): the most common UI size. Nav items, panel copy, table cells, menu items, buttons.
- **Meta** (Archivo, 13px; 12px for timestamps): secondary lines, hints, captions, field labels (13px, 600).
- **Label** (Archivo 600, 11px, 0.12em, uppercase, `font-stretch: 88%`): `.caps`, used for table heads, `<dt>` terms, nav group names, badges and priority.
- **Serial** (Azeret Mono 500, 13px, 0.04em, tabular, `--serial`): six-digit zero-padded numbers after a 10px caps "No." in `--ink-3`.

### Named Rules
**The Caps Are Labels Rule.** `.caps` names a field, a column or a group. It is never set above a heading as an eyebrow or kicker. A heading stands alone.

**The Engraved Voice Rule.** Bodoni carries headings, figures and quotations. Archivo carries everything a user reads in order to act. Never set body copy or buttons in Bodoni.

**The Plain Punctuation Rule.** UI copy uses no em or en dashes. Use commas, periods, or "by". Loading copy ends in three periods ("Submitting..."). Dates read "12 Oct 2026" (en-GB).

## Layout

The authenticated shell is a sidebar plus a column. The left sidebar is 240px (`w-60`) on desktop (lg, 1024px and up). A sticky 64px header (`h-16`, `--paper`, bottom hairline) carries the Bodoni page title, theme toggle, notifications bell and user menu. Content sits in `max-w-7xl` (1280px), centred, with gutters of 16px, 24px at sm, and 32px at lg (`px-4 sm:px-6 lg:px-8`), and vertical padding of 28px, or 40px at sm. Every route's content is re-keyed and settles in with `.page-enter`.

- **Dashboard:** a greeting block (Bodoni greeting, a summary sentence, a dateline in 13px `--ink-3`), then the Register denomination strip, then a two-column grid at xl (`1fr 340px`). The primary queue is in a `.frame`, secondary queues are in `.panel`, and "Recently sealed" sits in the aside. Vertical rhythm is `space-y-8` between bands and `gap-6` inside grids.
- **Task note:** `max-w-6xl` with a `1fr 320px` grid at lg. The note (`.frame`) and the activity record are on the left. The decision column is sticky (`lg:top-6`) on the right and stacks directly after the note on small screens.
- **Landing:** the same 1280px container. The hero is `5fr 7fr` at lg (tagline left, specimen note right). Section bands alternate `--paper` and `--paper-raised` with full-bleed hairlines, and use 80px vertical padding (96px at lg).
- **Auth:** a 12-column split at lg. A 5-column fine-lines brand panel with a turning hero rosette sits beside a 7-column form area. The form sits in a 420px `.frame`.

Responsive behavior: below lg the sidebar becomes a 256px drawer over a 40% ink scrim, opened from the header's list button. Tables collapse into stacked grid rows below sm. The Register goes from a 5-column strip to a 2-column grid. Notification and user menus become full-width sheets (`inset-x-3`) on phones. Spacing follows Tailwind's 4px scale. Common steps are 16px row padding, 20px panel padding, 24px stack gaps, and 32px between page bands.

### Named Rules
**The Queue Owns the Column Rule.** On the dashboard, the countersign queue (or "Waiting on you" for employees) is the first frame in the main column. Summary counts live in one Register strip above it, never as a row of stat cards.

**The Fixed Spine Rule.** Sidebar icons sit at a fixed x (rail centre 36px) in both states, so folding narrows the panel around them rather than reflowing the nav.

## Elevation & Depth

Depth is mostly printed rather than lifted. Surfaces separate by tone (`--paper` → `--paper-raised` → `--paper-sunk`) and by hairlines. The one structural device is the **banknote frame**: a 1px `--line-strong` border, a 3px inset gap in the paper colour, and a 1px inset `--line` rule. Together these draw a double engraved border with a faint, very soft drop beneath. Plain panels are flat. Real shadows appear only on things that float above the page: menus, dialogs, the peeking rail and the mobile drawer. All shadows use a strong negative spread so they read as a soft pool under the edge, never as a halo.

### Shadow Vocabulary
- **Frame drop** (`box-shadow: inset 0 0 0 3px var(--paper-raised), inset 0 0 0 4px var(--line), 0 10px 28px -18px rgb(var(--shadow-color) / 0.35)`): `.frame` only, for the primary queue, the task note, the specimen, auth forms and the landing record.
- **Menu** (`0 16px 40px -16px rgb(var(--shadow-color) / 0.4)`): the user menu.
- **Popover** (`0 20px 50px -20px rgb(var(--shadow-color) / 0.45)`): the notifications menu.
- **Dialog** (`0 24px 60px -20px rgb(var(--shadow-color) / 0.5)`): modal panels over an `--ink` scrim at 40%.
- **Rail peek** (`18px 0 44px -18px rgb(var(--shadow-color) / 0.4)`): the folded sidebar while it peeks open over the page.
- **Drawer** (`12px 0 40px -12px rgb(var(--shadow-color) / 0.35)`): the open mobile drawer.
- **Rail tab** (`0 6px 16px -8px rgb(var(--shadow-color) / 0.45)`): the fold handle on the sidebar edge.

### Named Rules
**The Flat Sheet Rule.** Panels, badges, buttons and inputs carry no shadow at rest or on hover. Shadow is reserved for the frame's engraved drop and for layers that float.

**The One Frame Rule.** A screen gets one `.frame` for its primary instrument (the queue, the note, the form). Everything secondary is a `.panel`.

## Shapes

There is one corner language. Tailwind's radius scale is remapped so that `rounded-sm` through `rounded-3xl` all resolve to 2px (`rounded-xs` is 1px). Whatever utility a developer reaches for, corners come out crisp and square-feeling. Panels, buttons, inputs, badges, nav items, menus, dialogs, alerts and `<kbd>` all carry 2px. The `.frame` declares no radius, so its double rule is square at 0px.

Circles (`rounded-full`) are kept for round things: avatars and their skeleton placeholders, seals and rosette medallions, the unread count, and the inline border spinner.

Other recurring geometry: diamonds (a square rotated 45deg, 10–11px) mark events on the activity trail. Priority uses three 2px × 12px bars, stacked as engraved weight marks. The Register is bounded by 3px double rules (`border-y-[3px] border-double`). Key dates use dotted leaders. The `.fine-lines` hatching is a 1px line every 6px at 118deg in `--note-ink` at 9%, the same angle as the theme wash.

### Named Rules
**The Two Pixel Rule.** Every corner is 2px or square. Never introduce 4px, 8px or pill radii. If something looks like it wants a pill, it wants a 2px overprint badge instead.

**The Circle Means Round Rule.** `rounded-full` is only for avatars, seals, rosettes and counts.

## Components

### Buttons
Calm, solid, and slightly pressed into the paper.
- **Shape:** 2px corners (`--radius-sm`), 40px minimum height (`min-h-10`), 16px side padding, 14px Archivo 600 at 0.01em, 8px gap for a leading Phosphor icon (16–18px).
- **Primary** (`.btn .btn-primary`): `--note` ground, `--on-note` text. Hover moves to `--note-deep`. Use one per view for the main act: "Sign in", "New task", "Approve and countersign".
- **Secondary** (`.btn .btn-secondary`): `--paper-raised` ground, `--ink` text, `--line-strong` border. Hover moves to `--paper-sunk`. Used for Cancel, "Create an account", and "Edit task".
- **Ghost** (`.btn .btn-ghost`): no ground, `--ink-2` text. Hover gives `--paper-sunk` with `--ink` text. Icon-only ghosts are 36px square (`w-9 min-h-9 px-0`), as on the theme toggle, the bell and the menu button.
- **Danger** (`.btn .btn-danger`): outline only, with `--serial` text and a border of `--serial` at 55%. On hover or focus it fills `--serial-fill` with white text. "Reject with reason" sits below a hairline and 32px apart from Approve so that neither is hit by accident.
- **States:** colours transition over 160ms `--ease-out-expo`. `:active` presses down 1px. `:disabled` sets opacity 0.55 and `cursor: not-allowed`. Busy buttons swap the icon for a spinner and the label for "Verb-ing..." text. Hero CTAs enlarge to `min-h-11 px-6 text-[15px]`.
- **Cursor:** every enabled `button`, `[role="button"]`, `select`, `summary` and `label[for]` gets `cursor: pointer` globally, because Tailwind v4 resets it. Disabled buttons get `not-allowed`.

### Badges (status, role, priority)
Badges read as square overprints on a note, one ink per state.
- **Status** (`StatusBadge`): `.caps`, 24px high, 8px side padding, 2px corners, 1px border. Pending uses `--paper-sunk`, `--ink-2` and `--line-strong`. Submitted uses `--seal-tint`, `--seal-ink` and `--seal`. Approved uses `--ok-tint`, `--ok` and `--ok` at 60%. Rejected uses `--serial-tint`, `--serial` and `--serial` at 60%. On the task note the badge is re-keyed per status and stamps in (`.stamp-in`).
- **Role** (`RoleBadge`): the same overprint shape, with authority shown as ink weight. Admin is a solid stamp (`bg-note`, `text-on-note`, `border-note`). Manager is a charcoal tint (`bg-note-tint`, `text-note-ink`, `--note-ink` border at 60%). Employee is neutral (`bg-paper-sunk`, `text-ink-2`, `border-line-strong`).
- **Priority** (`PriorityBadge`): no box. Three stacked 2px bars, with unused bars at 20% opacity, then the caps label. High has 3 bars in `--serial`. Medium has 2 in `--ink-2`. Low has 1 in `--ink-3`.
- **Active** marker: a Phosphor CheckCircle plus "Active" in `--ok`. Inactive uses MinusCircle in `--ink-3`.

### Cards / Containers
- **Frame** (`.frame`): `--paper-raised`, the double engraved rule, square corners, the frame drop. Padding is 24–36px (`px-6 py-7 sm:px-9 sm:py-8` on the task note, `px-5` on queue rows).
- **Panel** (`.panel`): `--paper-raised`, a 1px `--line` border, 2px corners, flat. Padding is 20px (`p-5`) for side panels and 24–32px for forms.
- **Alerts:** these are inline, not toasts. Errors use `role="alert"`, 2px corners, `--serial` at 50% for the border, a `--serial-tint` ground, a WarningCircle in `--serial`, and `--ink` text. Success uses `role="status"`, `--ok` at 40%, `--ok-tint`, and a CheckCircle.
- **Empty states:** a 48–56px `variant="mark"` Rosette in `--line-strong` beside a 15px semibold line and a 13–14px `--ink-3` explanation of what will appear there.
- **Skeletons:** blocks in `--paper-sunk` shaped like the real content. Frame and panel skeletons reuse those classes.

### Inputs / Fields
- **Style** (`.input`): full width, 40px minimum height, 8px × 12px padding, 2px corners, a 1px `--line-strong` border, a `--paper-raised` ground, 15px `--ink` text, and placeholders in `--ink-3`.
- **Hover:** the border moves to `--ink-3`.
- **Focus:** the border becomes `--note-ink` with a 3px ring of `--note-ink` at 22%. Elsewhere the global `:focus-visible` is a 2px `--note-ink` outline offset by 2px.
- **Error / Disabled:** `aria-invalid="true"` turns the border `--serial`, and `.field-error` (13px `--serial`) sits below. Disabled inputs take a `--paper-sunk` ground, `--ink-3` text, and `not-allowed`. Labels are `.field-label` (13px, 600, `--ink`). A "(required)" or "(optional)" suffix is set in regular `--ink-3`. Hints are `.field-hint` (13px `--ink-3`). Counters are tabular.

### Navigation
- **Sidebar** (`Sidebar.tsx`): a `--paper-raised` sheet with a right hairline and the BrandMark at the top in a 64px band. Groups ("Work", "Administration") are labelled with `.caps` in `--ink-3`. Items are 14px with a 19px Phosphor icon, 8px × 12px padding and 2px corners. Inactive items use `--ink-2` and hover to `--paper-sunk`. The active item gets a `--note-tint` ground, `--note-ink` semibold text, an inset 1px ring of `--note-ink` at 22%, a filled icon, and `aria-current="page"`. Profile and the fold control sit in the footer.
- **Fold and peek:** on desktop the rail folds to 72px. The state lives on `html[data-sidebar="collapsed"]`, is set before paint and persisted in localStorage. Labels crease back toward the spine (`.fold-label`: opacity plus `rotateY(-70deg)`) while group names become short rules (`.fold-rule`). The custom variants `folded:` (layout footprint) and `collapsed:` (look, unless peeking) drive it. While folded, hover (160ms delay) or keyboard focus makes the panel peek open over the page with the rail-peek shadow, and it closes after 240ms. The `[` key toggles the fold anywhere outside text fields (`aria-keyshortcuts="["`). The engraved right edge (a 6px `.fine-lines` strip) reveals a fold tab on hover.
- **Mobile:** a 256px drawer that slides from the left over an `--ink` scrim at 40%, with an X ghost button. Tapping any link closes it.
- **Header:** sticky, `--paper`, with a bottom hairline. A 36px ghost icon button group holds the theme toggle (Desktop, Sun and Moon cycle: System, Light, Dark) and the bell. The user button shows a 32px circular avatar (Bodoni initials on `--note-tint`), the name and the role. Its menu is a `.panel` with the menu shadow that unfolds from the top right.
- **Notifications menu:** a 400px popover (a full-width sheet on phones) with a Bodoni 20px title, an unread line and "Mark all as read". It lists six recent items. Each item has a Phosphor type icon in its reserved ink (assigned in charcoal, submitted in bronze ink, approved in bronze, rejected in red), a semibold title when unread, a relative time, and a Serial. Rows rise in on a stagger. The footer link is on `--paper-sunk`. The unread count is a 17px red circle (`--serial-fill`, white Azeret 9px, a 2px `--paper` border, showing "9+" above nine) that pops in when the count changes.

### Selectors
- **Segmented** (`components/ui/Segmented.tsx`): toggle buttons sharing one `--note-tint` plate (inset ring of `--note-ink` at 26%, the same as the active nav item) that glides to the active option and stretches to its width, across rows when the group wraps. It is used for the task status tabs, the notification filters, and the form's priority choice, where each option carries its `PriorityBars`. Lists re-key on a switch so their rows rise again.
- **Selects** (`select.input`): a thin caret in `--ink-3`. Where `appearance: base-select` is supported, the option list is a house menu: a raised sheet, a hairline border, the menu shadow, 2px rows with a sunk hover, and the selected row bold with an ink check. It unfolds with a short drop and the caret turns as it opens.
- **Deadline picker** (`components/tasks/DeadlinePicker.tsx`): a dating press. It has quick picks, a ledger calendar under a hatched month band, and two numbering-press drums for the time.
  - Months slide in from the side you head for (`.page-next` and `.page-prev`).
  - The chosen day is stamped in `--note` with a spreading ink ring (`.ink-stamp`).
  - Drum cells curve through a scroll-driven `drum-turn` and snap into an engraved window.
  - It is two columns, about 360px tall, from sm up, and it opens upward when there is no room below. On phones it is a bottom sheet.
  - Its value stays in the `datetime-local` shape.
- **Refresh** (`components/ui/RefreshButton.tsx`): the arrow turns while a refetch runs and always ends on a whole turn. The label swaps to "Refreshing..." in a fixed-width cell.

### Rosette and Seal (signature)
- **Rosette** (`components/ui/Rosette.tsx`): a generated guilloche, not an icon. A seeded PRNG picks lobe counts. Phase-shifted polar wave bands weave a lattice, and a closed hypotrochoid star fills the centre. It is drawn with `stroke="currentColor"` and non-scaling strokes in a `-100 -100 200 200` viewBox. The variants are `mark` (the BrandMark, empty states and list medallions), `seal` (inside Seal) and `hero` (the landing and auth panels). Colour comes from the text colour: `--note-ink` for brand, `--seal` for sealed items, and `--line-strong` for empty states. `draw` animates the strokes in, `.lathe` turns a hero rosette once every 160s, and `.lathe-hover` turns a mark 60deg on group hover.
- **Seal** (`components/ui/Seal.tsx`): the task's own rosette inside two engraved rings, with the legend ("Countersigned • 12 Oct 2026 •") set around the ring in Archivo 600 13px at 0.22em. The default tone is bronze, and a `serial` (red) tone exists for cancellation. It presses in (`.seal-press`, scale 1.12 to 1) only when the approval happens in the current session, never on revisit.
- **Serial** (`components/ui/Serial.tsx`): "No." in caps followed by six red Azeret digits. It heads and closes the task note (top left and bottom right, like a banknote) and leads every queue and table row.
- **Register** (`components/dashboard/Register.tsx`): the denomination strip. It has 3px double rules top and bottom and hairlines between cells. Each cell holds a StatusBadge over a 34px Bodoni CountUp, in the order Submitted, Pending, Rejected, Approved, then Total in `--ink-2`. Each cell links to the filtered task list.
- **CountUp:** renders the final value in HTML first, then counts from zero over 700ms (cubic ease-out) only when motion is allowed. Server output, no-JS visitors and reduced-motion users all see the real figure.

### Motion
All named animations live in `globals.css` inside `@media (prefers-reduced-motion: no-preference)`. The house curve is `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- `.rise` (420ms, 6px, staggered 40ms via `--i`) is used for list rows, Register cells and trail entries. `.page-enter` (460ms) applies per route.
- `.rosette-draw` (2.4s, 90ms stagger) and `.seal-press` (520ms) handle drawing and pressing. `.stamp-in` (520ms, overshoot with -6deg) re-stamps a status. `.pop-in` (420ms) is for counts. `.icon-turn` (480ms quarter turn) is for the theme icon after a click.
- `.dialog-backdrop` (220ms fade) and `.dialog-panel` (360ms settle) handle dialogs. `.menu-in` (200ms unfold from the top right) handles menus.
- `.nudge` moves rows and arrows 3px toward their target on group hover (220ms).
- `.reveal` and `.draw-line` are landing reveals bound to `animation-timeline: view()`, only where it is supported.
- Theme wash: `ThemeToggle` uses a View Transition that masks the new theme in along a 118deg feathered gradient (760ms, `cubic-bezier(0.65, 0, 0.35, 1)`), and is skipped under reduced motion.
- Under `prefers-reduced-motion: reduce`, one global rule resolves every transition at once (fold labels, rail width, drawer slide, button press) and holds `animate-pulse` skeletons still. `animate-spin` spinners keep turning because they report progress.

## Do's and Don'ts

### Do:
- **Do** take every colour from a token (`bg-paper-raised`, `text-ink-3`, `border-line-strong`) so both themes stay correct. Every token is one `light-dark()` pair.
- **Do** use charcoal (`.btn-primary`, `--note`) for the primary action, and only one per view.
- **Do** keep bronze for seals and the Submitted state only (badge, notification icon, submission marks on the trail). Keep green for approved, active and success. Keep numbering red for serials, overdue, rejection, High priority, errors, destructive actions and the unread count.
- **Do** use 2px corners (`rounded-sm`), and `rounded-full` only for avatars, seals, rosettes and counts.
- **Do** put a screen's primary instrument in one `.frame` and everything secondary in `.panel`.
- **Do** set headings, figures and quotations in Bodoni (`font-display`, `.engraved`), and set everything actionable in Archivo.
- **Do** use `.caps` for field terms, table heads and group names, and `tabular` for every number and date.
- **Do** use Phosphor icons (`@phosphor-icons/react`), regular weight by default, fill for the active nav item and the open bell, and bold for 12–14px carets and arrows.
- **Do** use a seeded `Rosette` for ornament and empty states. Seed it with the entity id so it stays stable.
- **Do** wrap every new animation in `@media (prefers-reduced-motion: no-preference)` (or `motion-safe:`), and render final values first, as `CountUp` does.
- **Do** write copy without em or en dashes, with curly quotes around quoted notes, and with dates as "12 Oct 2026".

### Don't:
- **Don't** build stat-tile rows, slate cards or pill badges. Counts go in the Register strip, and states go in square overprint badges.
- **Don't** tint the paper cream or ivory, and don't add a fourth accent hue.
- **Don't** use bronze or red for primary buttons, links, roles or decoration, and don't use bronze for any priority.
- **Don't** use radii above 2px or pill shapes on rectangular elements.
- **Don't** put eyebrow or kicker text above a heading.
- **Don't** hand-draw icon SVG or import another icon set. Rosettes and seals are generated artwork, not icons.
- **Don't** add shadows to panels, badges, buttons or inputs. Shadow belongs to the frame and to floating layers.
- **Don't** ship ungated keyframe animation. The global reduced-motion rule covers transitions and `animate-pulse` only; any new decorative `@keyframes` belongs inside the `no-preference` block or behind `motion-safe:`.
- **Don't** press the seal on every visit. It prints only when the approval happens in the current session.
- **Don't** leave an enabled control without `cursor: pointer` or a disabled one without `not-allowed`.
