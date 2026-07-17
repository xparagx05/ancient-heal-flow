# Phase 2 — Complete Healthcare Workflow

**Ground rule (unchanged):** No visual/UX changes to Home, Hero, Navbar styling, Founders, Doctors carousel, Pricing, Footer, existing `/dashboard`, `BookingModal`, or Razorpay flow. Only *extend* — add a new Portal menu item and new pages behind it. All new UI reuses the existing tokens, glass, gold gradient, and Cormorant nav typography.

Phase 2 is very large. To keep quality high and ship real (not stubbed) features, I'll deliver it in **four sub-phases**, each independently testable. This plan covers sub-phase **2A** in detail; 2B–2D are outlined so you know the shape.

---

## 2A — Foundations + Portal Menu + Appointments + Prescriptions (this sprint)

### 1. Navbar addition (non-destructive)
- Add a single new item **"Portal"** to the existing links array in `Navbar.tsx`, styled identically (same Cormorant serif, same hover gradient).
- Click opens a **premium dropdown** anchored to the item (Radix popover + glass panel, gold divider), with three tiles:
  - 👤 **Patient Portal** → `/auth?role=patient`
  - 👨‍⚕️ **Doctor Portal** → `/portal/doctor`
  - 🛡️ **Admin Portal** → `/portal/admin`
- When already signed in, the dropdown instead shows: current role badge, "Go to Dashboard", "Sign out".

### 2. Professional & Admin IDs
Migration:
- Add `professional_id text unique` to `doctors` (format `DOC-YYYY-####`).
- Add `admin_id text unique` to a new `admin_profiles(user_id, admin_id)` table.
- Sequence + trigger to assign on approval / on first admin role grant.
- Surface `professional_id` on `/doctor` dashboard header and in admin doctor list.

### 3. Role-scoped sign-in pages
- `/portal/doctor` — professional ID + password. Resolves ID → email server-side (edge function `resolve-doctor-id`) then signs in with email/password. Rejects if role ≠ doctor or application not `approved`; shows "Awaiting verification" or "Complete application" CTA.
- `/portal/admin` — admin ID + password, same pattern via `resolve-admin-id`. Hard-fails if user lacks admin role.
- Patient portal continues to use existing `/auth` (email/password + Google).

### 4. Appointments schema (the backbone for everything after)
New tables:
- `appointments` — patient_id, doctor_id, scheduled_at, duration_min, mode (`video`|`clinic`), status (`pending_payment`|`confirmed`|`in_progress`|`completed`|`cancelled`|`no_show`), fee, payment_id, room_url, started_at, ended_at, notes.
- `prescriptions` — appointment_id, doctor_id, patient_id, diagnosis, advice, follow_up_date, pdf_path, issued_at.
- `prescription_items` — prescription_id, medicine, dosage, frequency, duration, instructions, order_index.
- `consultation_notes` — appointment_id, subjective, objective, assessment, plan (SOAP).
- RLS: patient sees own rows; doctor sees rows where doctor_id = them; admin sees all. GRANTs to authenticated + service_role per rules.

### 5. Booking → appointment wiring
- After Razorpay success in the existing flow, insert a `confirmed` appointment (no UI change to the modal; only the success handler is extended).
- Patient dashboard gets a new "Upcoming Consultations" card (added *below* existing content, existing sections untouched).

### 6. Doctor workspace (real, replaces placeholders)
- `/doctor` overview — live counts from `appointments` for the signed-in doctor.
- `/doctor/appointments` — today / upcoming / past tabs, filters, search.
- `/doctor/patients/:id` — profile + past appointments + prescriptions timeline.
- `/doctor/consultations/:appointmentId` — the consultation workspace:
  - Patient summary panel
  - SOAP notes editor (autosave to `consultation_notes`)
  - **Prescription Builder** — add medicine rows (name, dosage, frequency, duration, instructions), reorder, remove
  - "Generate PDF" → edge function `generate-prescription-pdf` renders a branded PDF (Dhanvantara letterhead, doctor name + professional ID + signature line), uploads to a new private `prescriptions` bucket, stores signed URL path on `prescriptions.pdf_path`.
  - "Complete consultation" → sets `status=completed`, `ended_at=now()`, patient dashboard shows the prescription download.
- `/doctor/availability` — weekly hours grid stored in `doctor_availability` (day_of_week, start, end).

### 7. Patient side additions (additive only)
- New `<PrescriptionsCard/>` on `/dashboard` listing PDFs with download button (signed URL).
- New `<AppointmentsCard/>` showing upcoming + a "Join video" button that appears 10 min before start.
- Feedback modal after `completed` status — 1–5 stars + comment → `appointment_feedback` table.

---

## 2B — Video consultation (Daily.co, live)
- Wire `create-daily-room` into appointment confirmation; store `room_url` on the row.
- `/consult/:appointmentId` route with Daily's `@daily-co/daily-js` embed: waiting room, camera/mic toggles, chat, timer, connection indicator, end-call.
- On end: persist `started_at`/`ended_at`, mark appointment `completed`, auto-open prescription for doctor / feedback for patient.
- Graceful fallback UI when `DAILY_API_KEY` unset.

## 2C — Admin center (real functionality)
- User Management (search, filter, suspend/restore via `profiles.status`).
- Doctor Management extends existing Verification Center (suspend/reactivate, view docs).
- Appointment Center (all appointments, cancel/reschedule/reassign).
- Revenue Dashboard (subscriptions + consultations from Razorpay records + `appointments.fee`).
- Feedback Center + Reports Center (new `reports` table for user-submitted reports; admin actions: warn/suspend/ban).
- Notifications (broadcast table + patient/doctor inbox component).
- Analytics (revenue, appointments, growth, peak hours, top specializations, ratings) — computed via SQL views.

## 2D — Polish
- Lazy-load `/portal/*`, `/doctor/*`, `/admin/*`, `/consult/*` via `React.lazy` so homepage bundle is unaffected.
- Notifications toasts + bell dropdown wired to a `notifications` table.
- E2E RBAC audit + linter pass.

---

## Technical notes
- Stack unchanged: React 18 + Vite + Tailwind + shadcn + framer-motion + Supabase.
- New deps: `@react-pdf/renderer` (server-side via edge function using Deno-compatible `pdf-lib`) — I'll use `pdf-lib` in the edge function so no client bundle bloat.
- All new pages use existing tokens (`bg-gradient-gold`, `glass`, `font-display`) — zero new colors/fonts.
- Every new `public.*` table ships with GRANTs + RLS in the same migration.
- Professional ID resolution uses a `SECURITY DEFINER` function to avoid exposing `auth.users`.

---

## What I'll do first if you approve
1. Migration: `appointments`, `prescriptions`, `prescription_items`, `consultation_notes`, `doctor_availability`, `appointment_feedback`, `admin_profiles`, `professional_id` on `doctors`, ID sequences + triggers, RLS, GRANTs.
2. `prescriptions` storage bucket (private).
3. Navbar Portal dropdown.
4. `/portal/doctor` and `/portal/admin` sign-in pages + resolver edge functions.
5. Doctor consultation workspace + prescription builder + PDF edge function.
6. Patient dashboard additive cards.

Reply **"go 2A"** to start, or tell me which parts of 2A to drop/reorder (e.g. skip availability for now, defer PDF to 2B, etc.). 2B/2C/2D each follow as separate sprints so you can review incrementally instead of one giant unreviewable dump.
