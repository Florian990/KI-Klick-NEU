---
name: Lead notification email delivery
description: Distinguish Render provider rejections from development acceptance and actual mailbox delivery.
---

# Lead notification email delivery

Do not infer production email health from a successful development send.

**Why:** September 2026 Render logs supplied by the user showed Resend rejecting
the recipient with HTTP 403 (default test sender limited to the account's own
address), followed by Brevo rejecting an unauthorized outbound IP. Brevo's security
screen confirmed an unauthorized IP. A development Resend diagnostic did arrive,
but in Spam. These observations do not establish that credentials/accounts are
identical between environments or that a later IP authorization fixed delivery.

**How to apply:** Diagnose a fresh production attempt using Render logs first.
If accepted by the provider, inspect provider delivery events and then Gmail.
API acceptance is not proof of delivery; mailbox delivery is not Inbox placement.
Resend's default test sender is not a general-purpose unverified sender for arbitrary
recipients. A send-only key's inability to read delivery status is not a send failure.
Do not attribute Brevo rejections to unverified DNS without provider evidence.
An unauthorized IP proves a restriction, not why/when Render changed infrastructure.
Keep IP restrictions unless deliberately choosing a security tradeoff.

Production is hosted on Render separately from this development environment.
**Why:** Its configuration and outbound network differ; development-only tests
cannot establish production behavior.
**How to apply:** Verify production configuration independently without exposing
credentials. Never promise that a successful quiz response guarantees database
storage or email delivery; confirm each destination separately.
