🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v5.4)

Last Updated: Jan 2026
Status: 🔒 CORE STABLE + ✅ OTP HARDENING + ✅ PRICING CARD SELECTION FIXED + ✅ PRICING CLARITY SECTION + ✅ LEGAL HOOKUP + ✅ POST FLOW AUDITED + ✅ LISTINGS UI STABLE

✅ COMPLETED / LOCKED (DO NOT TOUCH)
1) Working Rules & Process

Rules Master finalized (how Manish works)

Code delivery format locked (paste-box only)

Add-only policy enforced

Mobile + Tablet + Desktop mandatory

Single-chat workflow accepted

2) Core UI Foundation

Dark SaaS-style theme locked

Header structure finalized (brand | nav | CTA)

Hero section hierarchy refined

Button system standardized

Card system finalized

3) Mobile Menu (NAV) — STATUS LOCKED

Mobile hamburger appears & works on:

Home ✅

Pricing ✅

Listings ✅ (acceptable)

Legal ✅

Post Property ✅

Strategy locked

❌ No HTML restructure

❌ No new JS toggle scripts

✅ CSS is the single source of truth

JS toggles only: body.nav-open + .menu.is-open

4) Authentication Philosophy — LOCKED

OTP logic finalized (session-based)

PIN login allowed

OTP limits & blocks defined (reference locked)

5) Pricing Page — Card Click Selection — ✅ FIXED & LOCKED

Pricing cards clickable (card + button)

Only one card selected at a time

Default Premium selected on load

Selected visual highlight stable

Final CSS override locked at END of /assets/styles.css

Mobile + Tablet + Desktop verified
🚫 Do not revisit unless broken

6) Session & OTP Backend Validation — ✅ COMPLETED

60 sec resend cooldown enforced

Max 3 OTP in 4 hours enforced

OTP validity (5 minutes) enforced

PIN restriction enforced

/me protected via Bearer token

Same-device session supported

7) OTP Security Hardening (Backend) — ✅ DONE

OTP single-use enforcement

Wrong OTP tries limit

Replay protection

/me endpoint confirmed working

Session expiry / revocation deferred

8) Plans / Pricing Page UX — ✅ COMPLETED & STABLE

Includes latest updates:

Plan copy clarified (who each plan is for)

Clear rule: 1 Plan = 1 Property

“No broker / no deal guarantee” messaging placed

“Next Step” guidance added (Select → Post Property)

Pricing Clarity Section added (Option 2 + 3 merged):

“Which plan is right for you?”

“Important before you select”

Pricing selection + UX flow stable

Mobile + Tablet + Desktop verified

Legal-safe, conversion-clear, rule-compliant
🚫 Do not revisit unless business model changes

9) Legal Page Final Hookup — ✅ COMPLETED

Footer links fixed (absolute paths)

Disclaimer aligned with locked business model

No banned words used

Mobile + Tablet + Desktop safe
🚫 Locked unless legal text changes

10) Post Property Page Audit — ✅ COMPLETED

File: /post/index.html

Flow clarity verified (PIN → OTP → Property → Plan)

No misleading verification wording

Frontend validation safety applied

Footer links & disclaimer aligned

Mobile + Tablet + Desktop UX verified

No OTP / pricing / CSS logic touched
🚫 Locked unless posting features change

11) Home Page Status — ✅ READY & STABLE

UI finalized

Hero + CTA hierarchy stable

Mobile + Tablet + Desktop verified
🚫 Locked unless brand direction changes

12) Listings Page UI — ✅ STABLE & FUTURE-READY (NEW)

Filters updated to City / Area / Property Type / Max Rent

Sorting intentionally removed (future feature)

“Search Properties” CTA added (UI-only)

Clear messaging: filters are UI-ready, backend coming later

“Unlock Details” controlled with future-safe note

Mobile + Tablet + Desktop balanced

No false promises / no misleading claims

🚫 Listings Page UI is now FROZEN
Further changes only when:

Real listings API is connected

Unlock logic is actually implemented

🧾 WHAT CHANGES WERE MADE (SUMMARY)
A) GLOBAL MOBILE MENU SUPPORT (CSS)

Supports multiple nav markup variants

Uses body.nav-open / .menu.is-open

Mobile dropdown positioned correctly

Full-width stacked links on mobile

B) LISTINGS PAGE — HAMBURGER ALIGNMENT

Listings-scoped CSS override

Space reserved for hamburger

Brand collision reduced
Result: Accepted (not perfect, OK)

C) PRICING PAGE — CARD CLICK SELECTION

Card-level + button-level click support

Single selected state enforced

Default Premium auto-selected

Visual highlight stable

D) PRICING PAGE — CLARITY SECTION

Option 2 + 3 merged

Improves decision clarity without changing logic

E) LEGAL PAGE FOOTER HOOKUP

Internal links corrected

Disclaimer aligned

F) POST PROPERTY FLOW

Legal-safe wording

Clear step order

Validation safety

Conversion-safe

G) LISTINGS PAGE FILTER UX (NEW)

City / Area / Type / Rent based filters

Search CTA added

Future-safe messaging

Sorting removed intentionally

⚠️ All CSS changes are ADD-ONLY and must remain at the end of styles.css.

⏳ PENDING TASKS (UPDATED PRIORITY)
🟠 PRIORITY 1 — UI POLISH (OPTIONAL, VERY LIMITED)

Minor spacing / alignment refinements only if needed

❌ No logic changes

❌ No new features

🟡 PRIORITY 2 — SEO & DISCOVERABILITY (DEFERRED)

Google Search Console review

On-page SEO audit
⚠️ Deferred until UI is fully frozen (almost there)

⚪ PRIORITY 3 — FUTURE (DO NOT START YET)

Listings API integration

Contact unlock logic

Customer Dashboard

AI Listing Assistant

Subscription Automation

Analytics & Event Tracking

▶️ NEXT IMMEDIATE STEP (RECOMMENDED)

👉 UI FREEZE CONFIRMATION
After this, move to:

SEO (GSC + on-page)
OR

Backend integration planning

🧠 EXECUTION RULE (REMINDER)

ONE task at a time

No parallel changes

Add-only safe patches

Never restructure HTML for nav/menu

If code is required → paste-box format only

END — v5.4 LOCKED
