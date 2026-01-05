🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v5.6)

Last Updated: Jan 2026
Overall Status:
🔒 Core Stable
✅ Auth + Pricing + Legal + Post Flow Locked
🟡 Listings UI FINALIZATION IN PROGRESS
⏳ SEO & Backend Planning Deferred

✅ COMPLETED & LOCKED (DO NOT TOUCH)
1) Working Rules & Execution Process — 🔒 LOCKED

Rules Master finalized (Manish working style)

Paste-box only code delivery rule enforced

Add-only policy strictly followed

Mobile + Tablet + Desktop mandatory

Single-chat workflow confirmed

2) Core UI Foundation — 🔒 LOCKED

Dark SaaS-style theme finalized

Header structure locked (Brand | Nav | CTA)

Hero hierarchy refined

Button system standardized

Card system finalized

3) Mobile Menu (NAV) — 🔒 LOCKED

Status: Stable & acceptable

Working on:

Home ✅

Pricing ✅

Listings ✅

Legal ✅

Post Property ✅

Strategy Locked:

❌ No HTML restructure

❌ No new JS toggles

✅ CSS is single source of truth
JS only toggles:

body.nav-open

.menu.is-open

4) Authentication Philosophy — 🔒 LOCKED

OTP is session confirmation only

PIN login allowed

No “verification / approval” language

Limits & cooldowns finalized

5) Pricing Page — Card Selection — 🔒 LOCKED

Card + button click both work

Only one card selectable

Premium selected by default

Visual highlight stable

Final CSS override locked at END of styles.css

All breakpoints verified
🚫 Revisit only if business model changes

6) Session & OTP Backend Validation — ✅ DONE

60s resend cooldown

Max 3 OTP / 4 hours

OTP validity: 5 minutes

PIN restriction enforced

/me protected with Bearer token

Same-device session supported

7) OTP Security Hardening — ✅ DONE

OTP single-use enforced

Wrong OTP attempt limit

Replay protection

/me endpoint verified

Session expiry strategy deferred (future)

8) Plans / Pricing Page UX — 🔒 LOCKED

Clear rule: 1 Plan = 1 Property

No broker / no deal guarantee copy placed

“Next Step” guidance added

Pricing Clarity section finalized:

Which plan is right for you?

Important before you select

Conversion-safe & legal-safe

9) Legal Page — 🔒 LOCKED

Footer links corrected (absolute paths)

Disclaimer aligned with zero-responsibility model

No banned words

Responsive verified

10) Post Property Page — 🔒 LOCKED

File: /post/index.html

Clear flow: PIN → OTP → Property → Plan

No misleading language

Frontend validation safe

Footer + disclaimer aligned

Responsive verified

11) Home Page — 🔒 LOCKED

UI finalized

Hero & CTA hierarchy stable

Responsive verified

🟡 LISTINGS PAGE — CURRENT ACTIVE WORK AREA
12) Listings Filters UI — IN PROGRESS (NOT FROZEN)

✅ What is DONE

Filters redesigned to be realistic:

City

Area / Sector

Property Type

Rent Range dropdown (exact ranges structure approved)

Sorting intentionally removed

“Search Properties” CTA added (UI-only)

“Unlock Details” future note present (inside each listing card)

Helper text bug fixed:

The text “Filters are UI-ready. Live search will be enabled in a future update.” was appearing in wrong place.

Text was found directly in HTML and removed.

✅ What is ALSO DONE (small cleanup)

Started moving inline spacing (style="margin-top:...") to CSS approach (better practice)

Added a dedicated class idea for listing note (.listing-note) (cleaner, consistent)

❌ What is STILL PENDING

Filters layout still needs final polish (too wide / too loose)

Need professional sidebar filter style (like your reference screenshots)

Need more filter options added (as decided):

City

Area

Size

Amenities

Price (slider + range style like reference)

Property Type

BHK Type

Rent Range (slider acceptable if we decide)

Property Age

Dropdown option visibility needs final lock (text readability inside dropdown list)

Decide final rent UI:

Either keep dropdown ranges (fast + clean)

OR replace with slider (like reference) — only if we can do it cleanly without breaking design

🎯 LISTINGS UI TARGET (REFERENCE-STYLE)

Goal: Filters should look like a professional real-estate sidebar (like your screenshots)

Sidebar filters on desktop (left)

Listings content on right

Compact, clean spacing

Checkbox / pill style for amenities and options

Slider UI for rent / price (if final decision is slider)

Mobile: sidebar collapses into stacked filters cleanly

⚠️ Listings UI MUST NOT be frozen until this is complete.

🧾 WHAT WE CHANGED SO FAR (TRACKING)

A) Global Mobile Menu Support (CSS-only)

Handles multiple nav markup variants

Dropdown alignment fixed

Full-width stacked links on mobile

B) Listings Page — Hamburger Alignment

Listings-scoped CSS override

Brand collision reduced
Status: Accepted (not perfect, OK)

C) Pricing Page — Selection Fix

Card + button click logic

Single selected state

Premium default

Highlight stable

D) Pricing Clarity Section

Option 2 + 3 merged

Improves understanding without logic change

E) Legal Page Footer Hookup

Internal links corrected

Disclaimer aligned

F) Post Property Flow

Legal-safe copy

Clear steps

Validation checks

G) Listings Filters UI (Active Work)

Core fields added

Sorting removed

CTA added

Helper text wrong-position bug fixed ✅

Rent Range structure approved ✅
🟡 Final layout + new filter blocks pending

⏳ UPDATED PRIORITY QUEUE
🟠 PRIORITY 1 — FINISH LISTINGS FILTER UI (NEXT)

Only active task.

Steps:

Convert current filters layout → sidebar professional layout

Add remaining filter groups:

Size

Amenities (checkbox/pills)

BHK type

Property Age

Decide & implement rent/price UI:

Dropdown (ranges) OR

Slider (reference style)

Fix dropdown option visibility permanently

Balance CTA size & alignment

Verify Desktop + Tablet + Mobile
✅ After this → FREEZE LISTINGS UI

🟡 PRIORITY 2 — SEO & DISCOVERABILITY (DEFERRED)

Start only after Listings freeze:

Google Search Console review

On-page SEO audit

⚪ PRIORITY 3 — FUTURE (DO NOT START YET)

Listings API integration

Contact unlock logic

Customer Dashboard

AI Listing Assistant

Subscription automation

Analytics & event tracking

▶️ NEXT IMMEDIATE ACTION (CONFIRMED)

👉 Finish Listings Filters UI
👉 Freeze Listings UI
👉 Then move to SEO or backend planning

🧠 FINAL EXECUTION RULE REMINDER

ONE task at a time

No parallel work

Add-only CSS

No nav HTML restructure

Paste-box only for code

END — MASTER v5.6 (READY FOR FUTURE USE)
