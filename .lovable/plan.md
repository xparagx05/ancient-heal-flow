
# Phase 3 — Admin Analytics & CMS

Focused, additive sprint on the Admin portal. No changes to Patient/Doctor UI, branding, layouts, or existing pages. Everything new lives inside existing admin routes that today render `AdminPlaceholder`.

## Scope

### 1. Live Admin Dashboard (`/admin`)
Replace the six static tiles with live counts and add a trends section — same glass-card layout, same tints, same typography.

- Total Users, Verified Doctors, Pending Verifications — already partially wired, extend.
- Appointments Today, Appointments This Month, Revenue This Month, Avg Doctor Rating — computed from `appointments` + `appointment_feedback`.
- Trends row (Recharts, area + bar):
  - Appointments per day (last 30 days)
  - Revenue per day (last 30 days)
  - Status breakdown donut (scheduled / confirmed / completed / cancelled)
- Recent activity feed: last 10 appointments with patient, doctor, status, timestamp.

### 2. Analytics page (`/admin/analytics`)
Currently `AdminPlaceholder`. Build a proper analytics view:

- Date-range selector (7d / 30d / 90d / custom).
- KPI strip: total revenue, total consultations, avg consultation duration, avg rating, completion rate, cancellation rate.
- Charts:
  - Revenue over time (area)
  - Appointments by status (stacked bar)
  - Top 5 doctors by consultations + by revenue (horizontal bar)
  - Feedback rating distribution (1–5 star bars)
- CSV export for the current range (client-side, no new edge function).

### 3. Appointments admin (`/admin/appointments`)
Currently placeholder. Read-only table:

- Filters: status, date range, doctor, patient search.
- Columns: date, patient, doctor, status, mode, fee, payment status.
- Row click → drawer with full appointment + prescription summary from `consultation_summaries`.
- Pagination (25/page).

### 4. Payments admin (`/admin/payments`)
Read-only revenue ledger from `appointments` where `payment_status = 'paid'`:

- Totals: gross, refunded, net.
- Table: date, patient, doctor, amount, razorpay_payment_id, status.
- CSV export.

### 5. Feedback admin (`/admin/feedback`)
Read-only:

- Rating distribution chart.
- Latest 50 reviews with patient, doctor, rating, comment, appointment date.
- Filter by doctor + min rating.

### 6. CMS (`/admin/cms`)
Editable landing content, stored in a new `site_content` table. Sections editable:

- Hero: eyebrow, headline, subhead, CTA labels
- Pricing plan blurbs (title, price, features[])
- Founder bios (name, title, blurb, order)
- Footer contact info

Admin edits via simple form → publishes → landing page reads the row on load with a small fallback to current hardcoded copy so the site never breaks if the row is missing.

### 7. Notifications center (`/admin/notifications`)
Read-only admin view of the `notifications` table (all recipients), filterable by type. Broadcast composer deferred.

## Technical details

### New table (single migration)

```sql
CREATE TABLE public.site_content (
  key text PRIMARY KEY,           -- 'hero' | 'pricing' | 'founders' | 'footer'
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site content"
  ON public.site_content FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Only admins can write site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Seed the four keys with today's hardcoded copy so the landing page renders identically after wire-up.

### Aggregations

All charts read directly from existing tables with parameterized `.select()` calls — no RPC needed for v1. Where a client-side sum is expensive (large row counts), fall back to `count: 'exact', head: true` and small day-bucketed selects.

### Libraries

- `recharts` — already a common shadcn dep, will `bun add` if not present.
- CSV export: tiny inline helper, no new dep.

### Files touched

New:
- `supabase/migrations/<ts>_site_content.sql`
- `src/pages/admin/AdminAnalytics.tsx`
- `src/pages/admin/AdminAppointments.tsx`
- `src/pages/admin/AdminPayments.tsx`
- `src/pages/admin/AdminFeedback.tsx`
- `src/pages/admin/AdminCMS.tsx`
- `src/pages/admin/AdminNotifications.tsx`
- `src/lib/admin/analytics.ts` (query helpers)
- `src/lib/admin/csv.ts`

Edited:
- `src/pages/admin/AdminDashboard.tsx` — live counts + trends row + activity feed
- `src/App.tsx` — swap `AdminPlaceholder` routes to the new pages
- Landing components (`Hero.tsx`, `Pricing.tsx`, `Founder.tsx`, `Footer.tsx`) — read from `site_content` with hardcoded fallback; **zero visual change**

Not touched: Navbar, Features, Experience, Doctors, DashboardPreview, ChatBot, all patient pages, all doctor pages, all auth/portal pages.

## Out of scope for Phase 3
- Broadcast notifications composer
- Admin-initiated refunds
- User management CRUD (`/admin/users`) beyond existing verification flow
- Email delivery of reports
- Demo mode

## Verification
- Type-check + build after each page.
- Seed a few test appointments to visually confirm charts render.
- Confirm landing page pixel-identical before and after CMS wire-up.

Reply **go** to start, or edit the scope.
