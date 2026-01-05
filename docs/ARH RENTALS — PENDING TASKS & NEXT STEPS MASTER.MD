🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v6.3)
Last Updated: Jan 2026 (Jan 6, 2026)

================================================

OVERALL GOAL (NON-NEGOTIABLE — LOCKED)

================================================
✅ Website visually premium
✅ Fast load (no bloat, no over-engineering)
✅ SEO-friendly (ONLY when explicitly asked)
✅ Mobile + Tablet + Desktop PERFECT (🔒 LOCKED FOREVER)
✅ No technical compromise at any layer

================================================

OVERALL PROJECT STATUS (CURRENT)

================================================
🔒 Core System: STABLE & LOCKED
🟡 Listings UI: FINALIZATION IN PROGRESS (ACTIVE WORK ZONE)
🟠 styles.css: FUNCTIONAL but has DUPLICATE blocks (cleanup needed, but ONLY after final fix)
🟡 Area / Sector input UX upgrade: ACTIVE
🟡 Pricing CSS “Final Lock” placement: NEEDS END-OF-FILE (pending)
⏳ SEO + Backend planning: DEFERRED (DO NOT TOUCH YET)

================================================

✅ COMPLETED & LOCKED (DO NOT TOUCH)

================================================

1) WORKING RULES & EXECUTION PROCESS — 🔒 LOCKED

• Single-chat workflow only
• One task at a time
• One file = one step = one paste box
• Exact change + exact location only (no full file rewrites)
• Mobile + Tablet + Desktop mandatory (FOREVER)

2) CORE UI FOUNDATION — 🔒 LOCKED

• Dark SaaS theme finalized
• Buttons, cards, spacing standardized
• Visual hierarchy stable

3) MOBILE NAVIGATION — 🔒 LOGIC LOCKED

Status: ✅ Verified & stable on ALL pages
Final rules (DO NOT CHANGE):
• JS single source of truth
• body.nav-open as state
• .menu.is-open / #primary-navigation.is-open
• .header-actions visible on mobile
• .header-cta hidden on mobile
• .nav-toggle always visible
File: assets/app.js

4) AUTHENTICATION & SESSIONS — 🔒 LOCKED

• OTP = session confirmation only
• PIN login allowed
• Same-device session supported
• No misleading language anywhere

5) OTP BACKEND RULES — 🔒 LOCKED

• Resend cooldown: 60 seconds
• Max OTP: 3 per 4 hours
• OTP validity: 5 minutes

6) LEGAL PAGE — 🔒 LOCKED

• Disclaimer aligned
• No banned / risky words
• Responsive verified

7) POST PROPERTY FLOW — 🔒 LOCKED

Flow: PIN → OTP → Property → Plan
• No false promises
• No misleading text

8) HOME PAGE — 🔒 LOCKED

• UI finalized
• Responsive verified

================================================

🟡 LISTINGS PAGE — CURRENT ACTIVE WORK AREA

================================================

9) LISTINGS FILTER SYSTEM — ARCHITECTURE LOCKED ✅

✅ FINAL DECISION: HYBRID FILTER MODEL

PRIMARY FILTERS (Top Bar) — 🔒 LOCKED
• Always visible
• Fast filtering

SECONDARY FILTERS (“More Filters” Panel) — 🔒 LOCKED
• Progressive disclosure
• Better mobile UX

PRIMARY FILTERS (LOCKED STRUCTURE)

Residential:
• City (Hisar)
• Category (Residential)
• Type (House / Flat / PG)
• Area / Sector (UPGRADE ACTIVE)
• Size (Sq Yds)
• Rent Range

Commercial:
• City (Hisar)
• Category (Commercial)
• Type (Shop / Office / Warehouse)
• Area / Sector (UPGRADE ACTIVE)
• Size (Sq Ft)
• Rent Range

📌 Size unit difference is FINAL & LOCKED (India standard)

SECONDARY FILTERS (LOCKED)

Residential:
• Amenities
• BHK
• Furnishing
• Property Age
• Floor: Ground / First / Second / Third+
❌ Basement NOT allowed

Commercial:
• Amenities
• Furnishing
• Floor: Basement / Ground / First / Second / Upper / Other

================================================

🟡 AREA / SECTOR INPUT — ACTIVE OWNER REQUEST

================================================

Purpose

Reduce huge dropdown pain + improve UX on mobile & desktop.

FINAL REQUIREMENTS (LOCKED)

• Typeable input
• Smart suggestions
• “Other” option mandatory
• Owner-approved Hisar list only
• Desktop + Tablet + Mobile compatible
• No browser-dependent datalist hacks

FINAL DECISION (LOCKED)

✅ Custom lightweight dropdown (NO framework)
✅ Popular areas shown first
✅ “More Areas” expands full list INSIDE panel
✅ Guaranteed open/expand behavior

✅ TODAY’S WORK SUMMARY (Jan 6, 2026) — WHAT WE DID
A) Listings “Area / Sector dropdown” CSS fixes attempted (UI/overflow/stack/scroll)

We added multiple CSS blocks to solve these real issues:
• Dropdown clip inside grid/card (overflow hidden)
• z-index stacking issue (panel behind content)
• Nested scrollbars issue (panel + inner lists both scrolling)
• Pill wrap + width fixes (long names, mobile safe)

B) Important NEW OBSERVATION (CRITICAL)

⚠️ styles.css currently contains multiple duplicate / overlapping “Area dropdown fix” blocks.
This causes confusion and makes future debugging risky.

C) TODAY’S FINAL DECISION

✅ Do NOT delete randomly right now (risk: dropdown break).
✅ Keep only the ONE final “AREA DROPDOWN (ONE SCROLL ONLY)” block as source of truth, but cleanup will be done safely in a controlled step.

================================================

✅ CONFIRMED & APPROVED AREA LIST (LOCKED)

================================================

SECTORS:
• Sector 1–4
• Sector 3
• Sector 5
• Sector 9–11
• Sector 13
• Sector 14
• Sector 15
• Sector 16–17
• Sector 24
• Sector MGA
• Sector 27–28
• Sector 33
• Sector-PLA

AREAS / LOCALITIES:
• New Grain Market
• Housing Board Colony (Sirsa Road)
• Sundar Nagar
• Vikas Nagar
• Parav Chowk
• Lahoria Chowk
• Preeti Nagar
• Professor Colony
• Aggarwal Colony
• Aggarsain Colony
• Prem Nagar
• Old Mandi Road
• Nagori Gate
• Other (MANDATORY)

⚠️ No assumptions. No auto-addition beyond this list.

================================================

🟡 PRICING PAGE — STATUS UPDATE (IMPORTANT)

================================================

Pricing CSS “Final Lock” exists, but:
⚠️ It must be at VERY END of styles.css to reliably override duplicates and page-level differences.

✅ Today’s decision:
We will not touch more tonight.
Tomorrow first task: move Pricing Final Lock to the very end of styles.css.

================================================

🔢 UPDATED PRIORITY QUEUE

================================================

🟠 PRIORITY 1 (TOMORROW FIRST STEP):
styles.css — Move “PRICING — FINAL LOCK” block to VERY END
Goal: pricing page stable + override guaranteed.

🟠 PRIORITY 2 (AFTER PRICING LOCK IS FIXED):
styles.css — Controlled cleanup of duplicate Area dropdown blocks
Rule: keep ONLY 1 final version (the “ONE SCROLL ONLY” logic) + remove older duplicates safely.

🟡 PRIORITY 3 (ACTIVE FEATURE WORK):
Listings Area / Sector input (HTML + minimal JS)
• Custom dropdown UI
• Popular first → expand full list
• Works in all browsers
• Freeze Listings UI after this

🟡 PRIORITY 4 (LATER):
SEO (ONLY after listings UI freeze)

⚪ FUTURE (DO NOT START):
• Listings API
• Dashboard
• AI Assistant
• Payments
• Analytics

================================================

▶️ WHERE WE START TOMORROW (VERY CLEAR)

================================================

✅ TOMORROW START POINT:
👉 styles.css

Move “PRICING — FINAL LOCK” block to the very end of file

Test pricing page

Then only: controlled removal of duplicate listing dropdown CSS blocks (safe cleanup)

================================================
✅ END — MASTER FILE v6.3
