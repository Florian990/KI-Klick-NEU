# Project Memory

- [esbuild allowlist vs Render](esbuild-allowlist-render.md) — packages in script/build.ts allowlist get bundled; native ones (nodemailer) build locally but fail on Render. Keep them external.
- [Quiz funnel lead counting](quiz-funnel-lead-tracking.md) — leads-table row count over-counts (partial saves insert rows); use `funnel_contact_submitted` event for conversions. Analytics edits must be additive-only.
- [Quiz question IDs](quiz-question-ids.md) — quiz ids are a permanent analytics key; on redesign use a FRESH id block, never reuse old ids.
- [App lives in subdir](app-lives-in-subdir.md) — app root is `AI-Profit-Funnel/` but code_execution/generateImage write from repo root; move assets in, restart Vite.
