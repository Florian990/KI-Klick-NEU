---
name: Lead notification email delivery
description: Why Brevo silently failed and how Resend was made the reliable sender for lead notifications.
---

# Lead notification email delivery

Lead notification emails (to the funnel owner) are sent best-effort AFTER the lead
is already persisted to the DB, so email failure never loses a lead. Primary sender
is now Resend; Brevo is a fallback. See `server/email.ts`.

**Why Brevo failed silently:** Brevo's REST API (`api.brevo.com/v3/smtp/email`)
returns HTTP 201 + a messageId even when the sending domain
(`noreply@geheime-ki-klickmethode.de`) is NOT SPF/DKIM-verified. The mail is
accepted but never delivered (dropped/spam). API success ≠ delivery. The API key
(`xkeysib...`, 89 chars) is valid — the key was never the problem.

**Why Resend is reliable here:** Resend's send-only key (`re_...`) can send from
`onboarding@resend.dev` WITHOUT any verified domain, and delivery to the owner
Gmail was confirmed (HTTP 200 + id). A restricted/send-only key cannot list
domains (`GET /domains` → 401 `restricted_api_key`) — that's expected, not a bug.

**How to apply:**
- Production runs on **Render**, not Replit. Replit secrets do NOT sync to Render.
  `RESEND_API_KEY` MUST be added to Render's env for the fix to work in production.
- Replit Mail / connector-proxy integrations rely on Replit-injected runtime creds
  and do NOT work on Render — use a plain API key (Resend) instead.
- To use a custom verified domain later, set `RESEND_FROM` env var; otherwise the
  default `onboarding@resend.dev` is used.
- Secrets are masked in the `viewEnvVars`/code_execution sandbox (returned as
  booleans). To test a real API call with the real key, run `curl` from bash where
  the secret is a real env var (never echo the value).
