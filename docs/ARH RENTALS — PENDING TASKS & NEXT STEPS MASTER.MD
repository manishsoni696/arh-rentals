ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v2)

This document defines what is DONE, what is PENDING, and what MUST be done next, in strict execution order.

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

Strategy remains:

❌ No HTML restructure

❌ No new JS toggle scripts

✅ CSS is the single source of truth

JS only toggles: body.nav-open + .menu.is-open

4) Authentication Philosophy

OTP logic finalized (session-based)

PIN login allowed

OTP limits & blocks defined (reference locked)

🧾 WHAT CHANGES WERE MADE (LATEST)
A) GLOBAL MOBILE MENU SUPPORT (CSS)

Added end-of-file mobile menu CSS that supports BOTH nav markup variants:

Variant A: .menu > .container > .nav-inner > a

Variant B: .menu > a direct children

Menu visibility standardized using:

body.nav-open and/or .menu.is-open

Dropdown positioning enforced under header (mobile)

Full-width stacked links enforced (mobile)

B) LISTINGS PAGE ONLY — HAMBURGER ALIGNMENT (CSS)

Added a Listings-scoped mobile override (CSS-only, add-only) to:

Reserve header space for hamburger

Pin hamburger position more consistently

Reduce collision with brand text

Result: “Not perfect, but OK” accepted.

⚠️ IMPORTANT:

These changes are ADD-ONLY CSS and must remain at the VERY END of styles.css.

⏳ PENDING TASKS (UPDATED PRIORITY ORDER)
🔴 PRIORITY 1 — STABILITY & SAFETY

Freeze CSS Base (NOW LOCKED)

Treat current /assets/styles.css as BASE

New CSS allowed only as:

scoped additions

minimal overrides

No “cleanup / consolidation” yet

Pricing Selection Bug (JS) — START HERE

Selection not persisting / click not selecting in some cases

Revenue-impacting: blocks plan conversion

Requires /assets/app.js audit + safe add-only patch

Session & OTP Backend Validation

Confirm backend respects:

same-device session bypass

OTP validity window

max sends in time window

block conditions

Verify edge cases (refresh, multi-tab, new browser)

🟠 PRIORITY 2 — CORE BUSINESS PAGES

Plans / Pricing Page UX (Copy + Flow)

Clarify plan benefits + what “unlock” means

Strengthen CTA intent (what happens after selection)

Reduce confusion: “No broker / no deal guarantee” messaging placement

Legal Page Final Hookup

Ensure correct internal linking:

Privacy Policy

Terms & Conditions

Disclaimer

Verify footer links are correct paths (no relative mistakes)

Post Property Page Audit

Field validation

Submission feedback

Mobile spacing check

🟡 PRIORITY 3 — SEO & DISCOVERABILITY

Google Search Console Review

Coverage errors

Sitemap verification

Query opportunities

On-page SEO Audit

H1/H2 hierarchy (each page)

Meta titles/descriptions

Internal linking consistency

🔵 PRIORITY 4 — USER EXPERIENCE BOOSTERS

WhatsApp / Call CTA Logic

Context-aware buttons (listing cards + header)

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
➤ START WITH: TASK 2 — Pricing Selection Bug (JS)

Reason:

Direct revenue impact

Already identified previously

Blocks plan conversion

🧠 EXECUTION RULE

ONE task at a time

No parallel changes

Only add-only safe patches

Never restructure HTML for nav/menu

If a task requires code: follow paste-box format strictly
