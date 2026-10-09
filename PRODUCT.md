# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Managers (primary).** Assign work to their team, then review submissions and approve or reject them with a reason. Their daily experience — clearing the approval queue — is the one to optimize first.
- **Employees.** Receive tasks with a deadline and priority, submit work with a note, and see the decision and any rejection reason.
- **Admins.** Manage users, roles, departments and manager assignments, and resolve password-reset requests.
- **Evaluators (public site).** People at organizations deciding whether to adopt the product. The product is meant to be offered to many companies, not built for one.

## Product Purpose

An assign → submit → approve/reject workflow for organizations. Every task carries a deadline, priority, submission note, decision, rejection reason and an activity log, and every step raises a notification. Success means managers clear their queue quickly and confidently, and nothing is lost between assignment and sign-off.

## Positioning

A focused approval loop with an auditable trail, not a general project-management board. *(Inferred from the codebase; not yet confirmed by the owner.)*

## Operating Context

- Used during the workday, primarily in desktop browsers; the authenticated shell also collapses to a drawer on small screens. *(Inferred.)*
- Organization structure: departments, managers with direct reports, employees.
- Sessions: short-lived access token held in memory, refreshed from an HttpOnly cookie; a page refresh silently restores the session.

## Capabilities and Constraints

- Roles: `admin`, `manager`, `employee`. Public signup creates employees; admins assign roles and managers.
- Task status: `PENDING`, `SUBMITTED`, `APPROVED`, `REJECTED`. Priority: `HIGH`, `MEDIUM`, `LOW`.
- Notifications with read/unread state. Password resets are requested by users and resolved by admins.
- Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, Redux Toolkit / RTK Query. API is a FastAPI service at `NEXT_PUBLIC_API_URL`.
- Routes: `/` (public landing — currently the Next.js starter, to be replaced), `/login`, `/signup`, `/forgot-password`, `/dashboard`, `/tasks`, `/tasks/create`, `/tasks/[id]`, `/notifications`, `/users`, `/users/[id]`, `/departments`, `/password-reset-requests`, `/profile`.
- **Open:** the backend has no tenant/organization model yet, so multi-company use is an intent, not a shipped capability.
- **Open:** product name (see Brand Commitments).

## Brand Commitments

- Current name "Office Task & Approval System" is open to replacement (owner, 2026-10-09). The clipboard-with-check mark is not binding.
- Owner-stated visual constraint: a majestic theme meant for a corporate app, with good fonts.

## Evidence on Hand

- Working product screens for every route above, and local test data (3 users across admin/manager/employee, 4 departments, 2 tasks, 9 notifications) in `../data.sql`.
- No customers, logos, testimonials, metrics, pricing, case studies or press exist. Public pages must not invent them.

## Product Principles

1. **The approval queue is the center of gravity.** A manager sees what awaits their decision first and can decide with full context — note, activity, deadline — on one screen.
2. **Every decision leaves a trail.** Approvals, rejections and reasons are recorded and visible; accountability is the feature.
3. **Authority without friction.** Role-gated power should feel deliberate and calm, never cluttered.
4. **Honest status.** Deadline, priority and state are legible at a glance; there is never doubt about where a task stands.
