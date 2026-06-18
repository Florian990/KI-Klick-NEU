---
name: Quiz funnel lead counting & analytics
description: Why the leads-table row count over-counts conversions, and the additive-only rule for analytics events in the KI-Klick funnel.
---

# Lead counting is NOT 1 row per person

`/api/quiz-partial` (server/routes.ts) calls `storage.createLead` every time the
contact form is partially saved with a phone OR email present (fires at the phone
step and again at the email step), and `/api/quiz-complete` creates ANOTHER row on
final submit. So one person who completes the funnel can insert up to ~3 rows in the
`leads` table, and partial droppers insert rows too.

**Rule:** Never treat `COUNT(leads)` as a clean conversion / unique-lead number.
The reliable "completed opt-in / Eintragung" metric is the `funnel_contact_submitted`
analytics event, which fires exactly once per completion (MiniFunnel last contact step).
On the admin dashboard, lead-table count is shown only as "DB-Einträge*" with a footnote.

**Why:** User saw "2 qualifiziert, 0 leads" and could not diagnose it; any conversion
math built on raw lead rows would also be inflated once leads start arriving.

# Analytics changes must be ADDITIVE only

Historical numbers live as rows in prod Postgres (`analytics_events`, `page_views`,
`leads`) that the user must not lose. When adjusting tracking: only ADD new event-type
strings + new aggregations + new display. Never rename, repurpose, or delete existing
event strings (`cta_click`, `funnel_q1..q3`, `funnel_qualified`, `funnel_contact_submitted`,
`calendly_open`). New events (`cta_shown`, `contact_view_name/phone/email`) have zero
history and only collect from deploy forward — tell the user this.

**How to apply:** Per-funnel-run dedup of view events uses a `useRef<Set>` in MiniFunnel
(`viewedContactStepsRef`) so back-navigation never double-counts (keeps drop-off ≤100%).
