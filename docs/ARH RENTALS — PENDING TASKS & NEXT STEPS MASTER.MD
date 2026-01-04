🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v5.2)

This document defines what is DONE, what is PENDING, and what MUST be done next, in strict execution order.
Last Updated: Jan 2026
Status: 🔒 CORE STABLE + ✅ OTP HARDENING + ✅ PRICING UX + ✅ LEGAL HOOKUP + ✅ POST FLOW AUDITED

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

Legal ✅

Post Property ✅

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

OTP single-use enforcement ✅

Wrong OTP tries limit using tries ✅

Replay protection ✅

/me endpoint confirmed working ✅

Session expiry / revocation → optional, deferred

8) Plans / Pricing Page UX (Copy + Flow) — ✅ COMPLETED

Plan copy clarified (who each plan is for)

Clear explanation: 1 Plan = 1 Property

“No broker / no deal guarantee” messaging placed correctly

“Next Step” guidance added (Select → Post Property)

Mobile + Tablet + Desktop verified

Legal-safe, conversion-clear, rule-compliant

🚫 Do not revisit unless business model changes

9) Legal Page Final Hookup — ✅ COMPLETED

Footer links fixed to correct absolute paths ✅

Disclaimer updated to match locked business model ✅

No banned words used ✅

Mobile + Tablet + Desktop safe ✅

🚫 Do not revisit unless legal text changes

10) Post Property Page Audit — ✅ COMPLETED (LATEST)

File: /post/index.html

Flow clarity verified (PIN → OTP → Property → Plan)

No misleading verification wording

Frontend validation safety applied

Footer links & disclaimer aligned

Mobile + Tablet + Desktop UX verified

No OTP / pricing / CSS logic touched

🚫 Locked unless posting features change

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

C) PRICING PAGE UX (HTML COPY)

Improved hero + plan copy clarity

Added “Next step” guidance section

D) LEGAL PAGE FOOTER HOOKUP (HTML)

Footer internal links corrected

Disclaimer text aligned with locked model

E) POST PROPERTY FLOW

Legal-safe wording

Clear step order

Validation safety

Conversion-safe

⚠️ All CSS changes are ADD-ONLY and must remain at end of styles.css

⏳ PENDING TASKS (UPDATED PRIORITY ORDER)
🟠 PRIORITY 1 — WEBSITE READINESS / POLISH (NEXT)

Micro UX Improvements

Button disabled/loading states

Feedback message consistency

Minor spacing refinements (safe-only)

WhatsApp / Call CTA Logic

Click behavior

Mobile-first handling

Legal-safe wording

🟡 PRIORITY 2 — SEO & DISCOVERABILITY (DEFERRED)

Google Search Console Review

On-page SEO Audit

⚠️ Explicitly postponed until website structure is frozen.

⚪ PRIORITY 3 — FUTURE (DO NOT START YET)

Customer Dashboard

AI Listing Assistant

Subscription Automation

Analytics & Event Tracking

▶️ NEXT IMMEDIATE STEP (CONFIRMED)

➤ START WITH: Micro UX Improvements

Reason:

Core business flow is now stable

Posting path audited and safe

Small UX polish improves perceived quality before SEO

🧠 EXECUTION RULE (REMINDER)

ONE task at a time

No parallel changes

Only add-only safe patches

Never restructure HTML for nav/menu

If a task requires code → paste-box format strictly

END — v5.2 LOCKED
