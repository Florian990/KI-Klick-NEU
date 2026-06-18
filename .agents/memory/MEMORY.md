# Project Memory

- [esbuild allowlist vs Render](esbuild-allowlist-render.md) — packages in script/build.ts allowlist get bundled; native ones (nodemailer) build locally but fail on Render. Keep them external.
- [Quiz funnel lead counting](quiz-funnel-lead-tracking.md) — leads-table row count over-counts (partial saves insert rows); use `funnel_contact_submitted` event for conversions. Analytics edits must be additive-only.
