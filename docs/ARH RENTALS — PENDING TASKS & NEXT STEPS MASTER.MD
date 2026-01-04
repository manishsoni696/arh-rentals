🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v3)

This document defines what is DONE, what is PENDING, and what MUST be done next, in strict execution order.
Last Updated: Jan 2026
Status: 🔒 CORE STABLE

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

⚠️ Security hardening items noted separately (not part of locked rules)

🧾 WHAT CHANGES WERE MADE (LATEST)
A) GLOBAL MOBILE MENU SUPPORT (CSS)

Added end-of-file mobile menu CSS supporting BOTH nav markup variants:

Variant A: .menu > .container > .nav-inner > a

Variant B: .menu > a (direct children)

Menu visibility standardized using:

body.nav-open and/or .menu.is-open

Dropdown positioned under header (mobile)

Full-width stacked links enforced (mobile)

B) LISTINGS PAGE ONLY — HAMBURGER ALIGNMENT (CSS)

Added Listings-scoped mobile override (CSS-only, add-only) to:

Reserve header space for hamburger

Pin hamburger position consistently

Reduce collision with brand text

Result:
“Not perfect, but OK” → ACCEPTED

⚠️ IMPORTANT
These changes are ADD-ONLY CSS and must remain at the VERY END of styles.css.

⏳ PENDING TASKS (UPDATED PRIORITY ORDER)
🔴 PRIORITY 1 — STABILITY & SECURITY (NEXT)

OTP Security Hardening (Backend)

OTP single-use enforcement (delete / mark-used after verify)

Use tries column to limit wrong OTP attempts

Optional: session expiry / revocation strategy

⚠️ These are security improvements, not bug fixes.
Core rules already pass.

🟠 PRIORITY 2 — CORE BUSINESS PAGES

Plans / Pricing Page UX (Copy + Flow)

Clarify plan benefits

Clarify what “Select / Selected” leads to

Improve placement of:

“No broker / no deal guarantee” messaging

Legal Page Final Hookup

Verify internal linking:

Privacy Policy

Terms & Conditions

Disclaimer

Check footer paths (absolute vs relative)

Post Property Page Audit

Field validation

Submission feedback

Mobile spacing & UX check

🟡 PRIORITY 3 — SEO & DISCOVERABILITY

Google Search Console Review

Coverage errors

Sitemap verification

Query opportunities

On-page SEO Audit

H1 / H2 hierarchy

Meta titles & descriptions

Internal linking consistency

🔵 PRIORITY 4 — USER EXPERIENCE BOOSTERS

WhatsApp / Call CTA Logic

Context-aware buttons (header + listings)

Mobile-first behavior

Micro UX Improvements

Hover feedback consistency

Loading states

Disabled button clarity

⚪ PRIORITY 5 — FUTURE (DO NOT START YET)

Customer Dashboard

AI Listing Assistant

Subscription Automation

Analytics & Event Tracking

▶️ NEXT IMMEDIATE STEP (RECOMMENDED)
➤ START WITH: OTP Security Hardening (Backend)

Reason:

Core business already stable

Revenue path unblocked

This improves production-grade security before scale

🧠 EXECUTION RULE (REMINDER)

ONE task at a time

No parallel changes

Only add-only safe patches

Never restructure HTML for nav/menu

If a task requires code → paste-box format strictly
