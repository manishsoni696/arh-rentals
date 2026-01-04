🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v5)

This document defines what is DONE, what is PENDING, and what MUST be done next, in strict execution order.
Last Updated: Jan 2026
Status: 🔒 CORE STABLE + ✅ OTP HARDENING APPLIED + ✅ PRICING UX DONE

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

Pricing card selection now works

Default Premium selected on load

Card click + button click both work

Selected visual highlight visible

Final winning CSS override locked at END of styles.css

🚫 Do not revisit unless broken again

6) Session & OTP Backend Validation — ✅ COMPLETED

Backend (Cloudflare Worker) validated against locked rules:

60 sec resend cooldown enforced ✅

Max 3 OTP in 4 hours enforced ✅

OTP validity (5 minutes) enforced ✅

PIN restriction enforced ✅

/me protected via Bearer token ✅

Same-device session logic supported (frontend + token) ✅

7) OTP Security Hardening (Backend) — ✅ DONE

Implemented production-grade protections:

OTP single-use enforcement

Wrong OTP tries limit using tries

Replay protection

/me endpoint confirmed working

Session expiry / revocation → optional, deferred

8) Plans / Pricing Page UX (Copy + Flow) — ✅ COMPLETED (LATEST)

Plan copy clarified (who each plan is for)

Clear explanation: 1 Plan = 1 Property

“No broker / no deal guarantee” messaging placed correctly

“Next Step” guidance added (Select → Post Property)

Mobile + Tablet + Desktop verified

Legal-safe, conversion-clear, rule-compliant

🚫 Do not revisit unless business model changes

🧾 WHAT CHANGES WERE MADE (SUMMARY)
A) GLOBAL MOBILE MENU SUPPORT (CSS)

Supports both nav markup variants

Uses body.nav-open / .menu.is-open

Mobile dropdown positioned correctly

Full-width stacked links on mobile

B) LISTINGS PAGE — HAMBURGER ALIGNMENT

Listings-scoped CSS override

Space reserved for hamburger

Brand collision reduced
Result: Accepted (not perfect, OK)

⚠️ All CSS changes are ADD-ONLY and must remain at end of styles.css

⏳ PENDING TASKS (UPDATED PRIORITY ORDER)
🟠 PRIORITY 1 — CORE BUSINESS PAGES (NEXT)

1) Legal Page Final Hookup (NEXT TASK)

Verify internal linking:

Privacy Policy

Terms & Conditions

Disclaimer

Check footer links:

Absolute vs relative paths

Mobile tap accuracy

Ensure disclaimer text matches locked business model

2) Post Property Page Audit

Field validation

Submission feedback

Mobile spacing & UX check

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

▶️ NEXT IMMEDIATE STEP (CONFIRMED)

➤ START WITH: Legal Page Final Hookup

Reason:

Pricing UX complete

Legal correctness protects business

Low risk, high importance

No backend dependency

🧠 EXECUTION RULE (REMINDER)

ONE task at a time

No parallel changes

Only add-only safe patches

Never restructure HTML for nav/menu

If a task requires code → paste-box format strictly

END — v5 LOCKED
