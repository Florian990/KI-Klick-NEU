---
name: Quiz question IDs are an analytics key, not just order
description: Why quiz question ids must be unique forever across funnel redesigns in the KI-Klick funnel.
---

# Quiz question ids are a permanent analytics key

The admin "Abbrüche pro Frage" breakdown is computed RETROACTIVELY from stored
`quiz_step_<id>` analytics events, joined against `QUIZ_QUESTIONS` (server/routes.ts)
by id for the label + `disqualifyAnswers`. Client `Quiz.tsx` and server
`QUIZ_QUESTIONS` must list the same ids + verbatim answer texts.

**Rule:** When you redesign/replace quiz questions, assign a FRESH id block that has
never been used before — do NOT reuse 1..N. Reusing an old id makes the retroactive
breakdown merge the OLD question's stored answers with the new question's answers
under one label (e.g. old "Beruf" answers showing under a new "Alter" question), and
disqualify flags mismatch.

**Why:** Historical events live in prod Postgres and cannot be cleaned per-question;
the only alternative to fresh ids is a full tracking reset (which also wipes traffic /
video / conversion history the user wants to keep).

**How to apply:** Old ids used historically: 1,2,3,4,5,7,8. The current 4-question
(+follow-up) set uses ids 11–15. The legacy macro fields `funnelQ1..5`
(count of `funnel_q1..5`) are NOT rendered on the dashboard, so the funnel_q event is
effectively vestigial — `funnel_start` / `funnel_qualified` / `funnel_disqualified`
(all id-independent) drive the macro funnel. Also update the id→label map in
`server/email.ts` (`questionTexts`) so lead mails show real question text, and remember
the external Zapier→Close CRM mapping reads the `answers` object keyed by these ids.
