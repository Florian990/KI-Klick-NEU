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

# Admin "test mode" must be gated by a server secret, not a client flag

The funnel completion endpoints (`/api/quiz-complete`, `/api/quiz-partial`) are PUBLIC.
A client-supplied boolean (`test:true`) must NEVER be allowed to skip `createLead` /
Zapier forwarding — any visitor or script could send it and suppress real leads.

**Rule:** Suppression is gated by `isAuthorizedTest(body)` = `body.test===true &&
ADMIN_TEST_TOKEN.length>0 && body.testToken===process.env.ADMIN_TEST_TOKEN`. Fail-safe:
if the env var is unset, nothing can suppress a lead. The admin obtains the token via
`GET /api/test-token` (behind basicAuth); the dashboard toggle fetches+stores it, and
`?test=<token>` works on other devices. Client side (useAnalytics.ts) only prefixes the
visitorId with `test-` (the stats-exclusion mechanism) when a token is stored locally —
that part is best-effort (a visitor can only hide themselves from analytics, not affect
leads). Strip `test`/`testToken` from the outbound Zapier payload. Don't log response
bodies for `/api/test-token` or `/api/leads` (token + PII) in server/index.ts.

**Why:** Architect FAILed the first version (client-trusted suppression = data-integrity
bypass). **Render deploy note:** this app runs on Render (Replit env vars do NOT
propagate there) — the SAME `ADMIN_TEST_TOKEN` must be set in Render's env for prod test
mode; until then prod test mode is inert (safe).

# Lead-capture endpoint must persist UTM, and dashboard base depends on funnel shape

`/api/quiz-complete` is THE lead-capture path for the restored (original) funnel —
the contact form posts there (not `/api/leads`) so it gets email + Zapier + secure
test-mode in one call. It MUST pass utm* through to `storage.createLead`, otherwise
DB/CSV/CRM attribution is silently lost (name/email/phone-only save is a regression).

**Funnel shape drives dashboard denominators:** the original funnel opens the quiz
immediately on `/` (no CTA-gate / no `/quiz` step), so `cta_shown`/`cta_click` stay 0.
The admin-stats "Funnel gestartet" row must be based on `uniqueVisitors`, NOT `ctaClick`
(dividing by 0 makes the first conversion row meaningless). The CTA cards stay in the UI
but read 0 by design for this flow.

**Why:** Architect FAILed the restore for dropping UTM in DB and for CTA-based funnel
math that no longer matches the immediate-quiz flow.
