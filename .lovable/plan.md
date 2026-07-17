# Phase 2B — Scoped Delivery Plan

Phase 2B as written is ~30+ features. Shipping it in one pass would produce broken flows, oversized migrations, and untestable code. I'll deliver it in 5 tight, verifiable sub-phases. Each preserves the existing UI/UX exactly and only extends behavior.

You approve one sub-phase at a time. I'll say when the previous sub-phase is verified before starting the next.

---

## 2B.1 — Appointment Lifecycle Wiring (core spine)

The single most valuable piece. Everything downstream depends on it.

- On Razorpay payment success (`verify-razorpay-payment` edge fn): create a real row in `appointments` (status `scheduled`, mode `video`, fee from Razorpay order, scheduled_at from patient booking) — currently appointments live only in `localStorage` via `BookingContext`.
- Add a `notifications` table (recipient_user_id, role, type, title, body, link, read_at) + RLS + realtime publication.
- Doctor accepts / rejects appointment → status transitions `scheduled → confirmed → in_progress → completed | cancelled`. Emit notifications on each transition.
- Patient dashboard `<AppointmentsCard/>` starts reading from Supabase (not localStorage). LocalStorage stays as legacy fallback for old bookings so nothing you see today disappears.

Deliverable: booking → payment → doctor sees it live → confirm → both sides see confirmed status.

## 2B.2 — Daily.co Video + Join Window

- Add `DAILY_API_KEY` (I'll request via `add_secret` when you're ready — you'll paste it into the secure form).
- On appointment `confirmed`, call `create-daily-room` and persist `video_room_url`, `video_room_name`, `video_expires_at` on the appointment row.
- New `/consult/:appointmentId` route (lazy-loaded) with `@daily-co/daily-js` prebuilt embed: waiting room, mic/cam controls, chat, screenshare, network indicator, timer, participant names, end call.
- "Join video" button visible on both dashboards from T-10min until appointment end. Missing key → graceful "Video not yet available" message (already scaffolded).
- On call end: record `started_at`, `ended_at`, `duration_seconds`; auto-open prescription workspace for doctor + feedback modal for patient.

## 2B.3 — Realtime Notifications + Notification Center

- Enable Supabase Realtime on `notifications` + `appointments`.
- Reuse existing `NotificationBell` component; swap its data source from `BookingContext` in-memory to Supabase realtime channel scoped to `auth.uid()`.
- New `<NotificationCenter/>` panel (glass card, matches existing bell dropdown styling) with unread count, mark read, delete, filter by type. Same component used in Patient/Doctor/Admin portals — one visual, three data scopes.
- Triggers fire notifications for: booking confirmed, doctor accept/reject, prescription ready, feedback request, doctor application (admin), new report (admin).

## 2B.4 — Feedback + Patient Prescription Timeline + Doctor Workspace polish

- Feedback modal on consultation end → writes to existing `appointment_feedback` table. Doctor sees aggregate rating on dashboard (already scaffolded to read).
- Patient dashboard gets a "Prescription Timeline" additive card (existing `<PrescriptionsCard/>` extended, not redesigned) with signed-URL download.
- Doctor `DoctorConsultation.tsx` split layout: left = video embed + collapsible patient context (profile, past prescriptions, uploaded files). Right = existing SOAP + Rx builder untouched. Autosave interval tightened to every 8s (currently on-blur only).
- Admin `AdminDoctors` already works; add live counts to `AdminDashboard` (users, doctors, appointments today, revenue this month) using SQL aggregate reads.

## 2B.5 — Optional extensions (only if you still want them after 2B.1–4 ship)

Explicitly deferred so we don't drown 2B:

- AI assistant for doctor note formatting (Lovable AI Gateway, doctor-approval required)
- Global search across roles
- Patient file uploads (medical reports bucket)
- Email automation (appointment confirmation, prescription ready) — needs email infra; I'll run `email_domain--check_email_domain_status` when we get here
- Analytics charts (Recharts) for admin
- Confetti / advanced micro-interactions
- Doctor Calendar view + Patients directory pages

Each of these is a real ~1–2h chunk. Bundling them into 2B is what would break the existing UI. I'd rather ship 2B.1–4 solidly, then let you pick which of 2B.5 to do next.

---

## Technical notes (skip if not interested)

- Migrations: one per sub-phase. Each `CREATE TABLE` in `public` gets `GRANT`s + RLS + policies in the same file (per project rules).
- No changes to: Hero, Navbar, Founder, Pricing, Footer, Index landing, existing patient/doctor/admin dashboard shells. Only additive cards and new routes.
- Everything new is lazy-loaded so `/` bundle size stays flat.
- RBAC: notifications scoped by `recipient_user_id = auth.uid()`; consult room access checked server-side against appointment participants.
- Legacy `BookingContext` localStorage stays in place during 2B.1 to keep the existing patient booking demo working; we migrate reads to Supabase without removing the fallback.

---

## What I need from you

Reply with one of:

- **"go 2B.1"** → I start immediately with the appointment lifecycle wiring.
- **"go 2B.1 without X"** → drop something from 2B.1.
- **"reorder: video first"** → do 2B.2 before 2B.1 (I'll flag the dependency risk).
- **"do it all"** → I'll still ship in this order, just without pausing between sub-phases. Higher risk of a rough intermediate state visible in the preview.
