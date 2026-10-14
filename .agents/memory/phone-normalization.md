---
name: Lead phone normalization
description: Why lead phone handling must accept international pasted numbers without duplicating the dropdown code.
---

Normalize clearly interpretable phone inputs instead of rejecting a valid number
simply because it already includes its country code. Do not guess corrections to
ambiguous digits or contradictory country prefixes.

**Why:** The previous form concatenated its country dropdown with a pasted
international number. The user reported failed Zapier/Close transfers and missing
leads. Frontend-only validation cannot protect submissions from older open forms
or other API callers.

**How to apply:** Keep browser and server normalization consistent before storage,
email and CRM forwarding. A format fix is not proof that a number is reachable or
that missing historical CRM leads were recovered; assess recovery separately.
