🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v5)

Last Updated: Jan 2026
Status: 🔒 CORE STABLE + 🟢 PRICING UX (PARTIAL) COMPLETED

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

3) Mobile Menu (NAV) — STATUS LOCKED (DO NOT REWORK)

Mobile hamburger now appears and opens on:

Home ✅

Pricing ✅

Listings ✅ (not perfect, but acceptable)

Legal ✅ (for now)

Strategy locked:

❌ No HTML restructure

❌ No new JS toggle scripts

✅ CSS is the single source of truth

JS only toggles: body.nav-open + .menu.is-open

4) Authentication Philosophy (LOCKED)

OTP logic finalized (session-based)

PIN login allowed

OTP limits & blocks defined (reference locked)

5) Pricing Selection Bug (JS/CSS) — ✅ FIXED

Pricing card selection works

Default Premium selected on load

Card click + button click both work

Selected visual highlight visible

Final winning CSS override locked at END of styles.css

🚫 Do not revisit unless broken again

6) Session & OTP Backend Validation — ✅ COMPLETED

Backend (Cloudflare Worker) validated:

60 sec resend cooldown enforced ✅

Max 3 OTP in 4 hours enforced ✅

OTP validity (5 minutes) enforced ✅

PIN restriction enforced ✅

/me protected via Bearer token ✅

Same-device session logic supported ✅

7) OTP Security Hardening (Backend) — ✅ DONE

Production-grade protections applied:

OTP single-use enforcement (delete after verify) ✅

Wrong OTP tries limit using tries column ✅

Proper lock message on max attempts ✅

/me endpoint restored & working ✅

🧾 WHAT CHANGES WERE MADE (LATEST)
A) GLOBAL MOBILE MENU SUPPORT (CSS)

Supports BOTH nav markup variants:

Variant A: .menu > .container > .nav-inner > a

Variant B: .menu > a

Visibility via body.nav-open / .menu.is-open

Dropdown positioned under header (mobile)

Full-width stacked links (mobile)

B) LISTINGS PAGE — HAMBURGER ALIGNMENT (CSS)

Header space reserved

Hamburger pinned consistently

Brand collision reduced

Result: “Not perfect, but OK” → ACCEPTED
⚠️ Add-only CSS at VERY END of styles.css

🟢 PARTIALLY COMPLETED TASKS
8) Plans / Pricing Page UX (Copy + Flow) — 🟡 PARTIAL

COMPLETED:

Hero section copy clarified:

Owner-posted platform messaging

No broker / no guarantee clarity

“1 Plan = 1 Property” made explicit

“Next Step” guidance added below pricing grid

Mobile / Tablet / Desktop safe (no layout break)

PENDING (STILL TO DO IN THIS TASK):

Pricing card subtext polish (Basic / Premium / Pro descriptions)

Clarify “Select / Selected” → what happens next (inside card area)

Improve placement/emphasis of disclaimer inside cards (without duplication)

⏳ PENDING TASKS (UPDATED PRIORITY ORDER)
🟠 PRIORITY 1 — CORE BUSINESS PAGES

Continue: Plans / Pricing Page UX (Remaining items)

Card-level copy polish

CTA intent clarity (post-selection expectation)

Legal Page Final Hookup

Verify internal links:

Privacy Policy

Terms & Conditions

Disclaimer

Footer path correctness (relative vs absolute)

Post Property Page Audit

Field validation

Submission feedback

Mobile spacing & UX

🟡 PRIORITY 2 — SEO & DISCOVERABILITY

Google Search Console Review

On-page SEO Audit

🔵 PRIORITY 3 — USER EXPERIENCE BOOSTERS

WhatsApp / Call CTA Logic

Micro UX Improvements

⚪ PRIORITY 4 — FUTURE (DO NOT START YET)

Customer Dashboard

AI Listing Assistant

Subscription Automation

Analytics & Event Tracking

▶️ NEXT IMMEDIATE STEP (RECOMMENDED)

➤ CONTINUE TASK 8 — Plans / Pricing Page UX (Remaining)

Reason:

Flow already started

No backend risk

Direct conversion improvement

🧠 EXECUTION RULE (REMINDER)

ONE step at a time

Exact location + paste-box only

No parallel changes

No nav/menu restructuring

STATUS: ✅ Stable • 🟡 UX polish in progress
