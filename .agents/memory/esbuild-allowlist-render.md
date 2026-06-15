---
name: esbuild bundle allowlist vs Render build
description: Why adding packages to script/build.ts allowlist can break the Render deploy
---

# esbuild allowlist breaks Render build

The AI-Profit-Funnel app builds the server with esbuild in `script/build.ts`. Packages listed in the `allowlist` array get **bundled** into `dist/index.cjs`; everything else stays external and is installed normally by Render.

**Rule:** Only add a package to the allowlist if it bundles cleanly. Packages with native modules or complex conditional requires (e.g. `nodemailer`) can build fine locally but fail on Render with "Exited with status 1 while building your code".

**Why:** `nodemailer` was added to the allowlist; local build passed but every Render deploy failed. Fix was to remove it from the allowlist AND uninstall it (the code uses native `fetch` against the Brevo API, not nodemailer).

**How to apply:** If a Render deploy fails to build right after a dependency change, first check whether the new package was added to the `allowlist` in `script/build.ts`. Leave email-type/native packages external.

## Deploy pipeline (not in this repl)
- Code lives in GitHub `Florian990/KI-Klick-NEU`, branch `main`.
- Render service `ki-klick` auto-deploys from main. Replit is dev only — changes must be pushed to GitHub.
- Secrets set in Replit do NOT propagate to Render. Each secret (e.g. `BREVO_SMTP_KEY`) must be added separately in Render → ki-klick → Environment.
- Lead email flow: `server/email.ts` posts to `https://api.brevo.com/v3/smtp/email` using `process.env.BREVO_SMTP_KEY`, FROM `noreply@geheime-ki-klickmethode.de` TO `ki.klick.methode@gmail.com`. If the key is missing it skips silently (logs a warning), never crashes.
