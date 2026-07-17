## Phase 1 — Auth, RBAC, and Portal Shells

Goal: add real authentication, role-based routing, and empty Doctor + Admin dashboard shells that match the existing Dhanvantara AI design. **Zero changes** to Home, Hero, Founders, Pricing, Footer, existing Patient Dashboard, or booking flow.

### 1. Database (migration)

Tables (all in `public`, with GRANTs + RLS + `has_role` security-definer function per RBAC best practices):

- `profiles` — `user_id`, `full_name`, `email`, `phone`, `avatar_url`
- `app_role` enum — `patient` | `doctor` | `admin` (extensible to `super_admin`, `moderator` later)
- `user_roles` — `user_id`, `role` (roles NEVER on profiles)
- `doctor_applications` — full onboarding payload: reg number, specialization, qualification, experience, clinic, fee, languages, working hours, gov ID url, license url, bio, `status` (`pending` | `approved` | `rejected` | `needs_info` | `suspended`), admin notes
- `doctors` — approved doctor directory (created on approval), links to `user_id` + application
- `storage bucket` `doctor-documents` (private) for ID/license uploads

RLS:
- Users read/update own profile
- Users read own roles; only admins insert/delete roles
- Doctors read/update own application; admins read/update all
- `has_role(uuid, app_role)` security-definer function used in every policy that checks admin

Trigger: on `auth.users` insert → create `profiles` row + assign default `patient` role.

Admin bootstrap: after you sign up, I'll give you a one-line SQL snippet:
```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com';
```

### 2. Auth

- Enable email/password (no auto-confirm off by default — I'll turn auto-confirm ON for dev speed; you can disable later)
- Google OAuth via `lovable.auth.signInWithOAuth`
- New route `/auth` — login + signup tabs, matches existing glass/navy/gold theme
- `AuthProvider` context (session + role) with `onAuthStateChange` listener
- `ProtectedRoute` component: `requiredRole?: 'patient' | 'doctor' | 'admin'`
- Post-login role router: patient → `/dashboard`, doctor → `/doctor` (or `/doctor/pending` if not approved), admin → `/admin`

### 3. Doctor Portal shell (`/doctor/*`)

- `/doctor/apply` — full multi-step onboarding form (all fields you listed + document uploads to storage bucket)
- `/doctor/pending` — "Application under review" state screen
- `/doctor` — dashboard shell with cards (Today's Patients, Upcoming, Completed, Pending, Avg Rating, Earnings, Monthly Stats) — numbers are 0/placeholder in Phase 1
- Sidebar nav for future sections (Appointments, Calendar, Availability, Consultations, Analytics, Feedback) — routes registered but pages are "Coming in Phase 2" placeholders
- Uses existing glass cards, navy+gold, Cormorant/Playfair typography

### 4. Admin Portal shell (`/admin/*`)

- `/admin` — overview dashboard shell (Total Users, Doctors, Appointments, Revenue, Pending Reports, etc. — live counts where trivially available, else 0)
- `/admin/doctors` — **Doctor Verification Center** (functional in Phase 1): list applications, view uploaded docs, Approve / Reject / Request Info / Suspend
- Sidebar nav placeholders for Users, Appointments, Payments, Feedback, Reports, Notifications, CMS, Analytics

On approve: insert into `doctors`, ensure `doctor` role in `user_roles`, application status → `approved`. Email notification deferred to Phase 4.

### 5. Video consultation (Daily.co) — infrastructure only in Phase 1

- Add secret request for `DAILY_API_KEY` (graceful degradation if missing)
- Edge function `create-daily-room` (stub, called when appointment is confirmed in Phase 2)
- Modular provider interface (`src/lib/video/provider.ts`) so Twilio/Jitsi can swap later
- No UI wiring yet — full consultation workspace lands in Phase 2

### 6. What is NOT touched

Home, Hero, Navbar (I'll only add a subtle "Sign in" affordance if you don't already have one — otherwise unchanged), Founders, Doctors carousel, Pricing, Footer, existing `/dashboard`, `BookingModal`, Razorpay flow, all animations, colors, typography.

### Deliverables at end of Phase 1

- You can sign up, get promoted to admin via SQL, log in as admin, see Verification Center
- A second account can apply as a doctor, get approved, log in and see the doctor dashboard shell
- Patient flow works exactly as today
- Foundation ready for Phase 2 (appointments, prescriptions, calendar, real video)

### Technical notes

- Migration will be a single call with all tables, GRANTs, RLS, `has_role`, trigger
- Google OAuth uses `supabase--configure_social_auth`
- Daily.co API key requested via `add_secret` at the end of Phase 1 or start of Phase 2 — your choice
- All new pages use existing Tailwind tokens, `glass` class, `text-gradient-gold`, Cormorant/Playfair fonts already in `index.css`

Reply "go" to start, or tell me anything to adjust (e.g. skip Google OAuth, defer Daily secret, different admin email, etc.).