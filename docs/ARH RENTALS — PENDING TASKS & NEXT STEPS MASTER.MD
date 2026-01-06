🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v6.5)

Last Updated: Jan 2026 (Jan 7, 2026)

OVERALL GOAL (NON-NEGOTIABLE — 🔒 LOCKED)

✅ Website visually premium
✅ Fast load (no bloat, no over-engineering)
✅ SEO-friendly (ONLY when explicitly asked)
✅ Mobile + Tablet + Desktop PERFECT (🔒 LOCKED FOREVER)
✅ No technical compromise at any layer


OVERALL PROJECT STATUS (CURRENT)

🔒 Core System: STABLE & LOCKED
🟡 Listings UI: FINALIZATION IN PROGRESS (ACTIVE WORK ZONE)
🟠 styles.css: FUNCTIONAL, cleanup pending (duplicate Listings + Area dropdown blocks)
🟢 Pricing CSS “FINAL LOCK”: DONE & LOCKED (END-OF-FILE CONFIRMED)
🟢 Area / Sector input UX upgrade: DONE (HTML + JS behavior locked as per last “PERFECT 100%” approval)
⏳ SEO + Backend planning: DEFERRED (DO NOT TOUCH YET)


✅ COMPLETED & LOCKED (DO NOT TOUCH)

1) WORKING RULES & EXECUTION PROCESS — 🔒 LOCKED
• Single-chat workflow only
• One task at a time
• One file = one step = one paste box
• Exact change + exact location only
• Mobile + Tablet + Desktop mandatory (FOREVER)

2) CORE UI FOUNDATION — 🔒 LOCKED
• Dark SaaS theme finalized
• Buttons, cards, spacing standardized
• Visual hierarchy stable

3) MOBILE NAVIGATION — 🔒 LOGIC LOCKED
Status: ✅ Verified & stable on ALL pages
Rules (DO NOT CHANGE):
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

9) DEAL UNLOCK RULES (PRE + POST) — 🔒 LOCKED
A) Pre-Unlock Mandatory Popup — 🔒
• Mandatory popup before deal unlock
• Unlock = contact access only
• Property availability NOT guaranteed
• Property may already be rented / owner may decline
• ARH Rentals = information-access platform only
Popup acceptance mandatory before unlock.

B) Post-Unlock Availability Handling — 🔒
If after unlock:
• Property already rented OR
• Owner declines
Then:
• Tenant can submit “Not Available” feedback
• Listing temporarily hidden / paused
• Further unlocks avoided
• Owner gets re-confirm option (Reactivate / Close)

❌ No availability guarantee
❌ No refund promise
❌ Zero responsibility model intact

10) BROKER-LISTED TRANSPARENCY RULE — 🔒 LOCKED (REFERENCE)
• Neutral broker tag (future)
• Feedback-based transparency only
• No verification / penalty / guarantee


🟡 LISTINGS PAGE — CURRENT ACTIVE WORK AREA
⚠️ NO CHANGE BELOW THIS SECTION EXCEPT PRIORITY QUEUE


11) LISTINGS FILTER SYSTEM — ARCHITECTURE LOCKED ✅
✅ FINAL DECISION: Hybrid Filter Model
(Primary always visible + Secondary via More Filters)


✅ RECENT CHANGES COMPLETED (THIS SESSION)

A) Listings Buttons Layout (Clear + Search) — ✅ DONE (CSS)
File: assets/styles.css
• Primary actions row stabilized
• Search button width controlled via clamp()
• Removed “full-width/over-stretch” behavior
• Goal achieved: buttons look premium and stable across Desktop/Tablet/Mobile
NOTE (IMPORTANT):
• If buttons ever appear “dur dur” (far apart), ensure:
  - .primary-actions uses justify-content:flex-end
  - DO NOT keep margin-left:auto on .btn-primary (unless intentionally spacing)

B) Select Dropdown Text / Options (Dark theme) — ✅ DONE (CSS)
File: assets/styles.css
• Added:
  .listings-page select.input option { background:#0b0f14; color:#f5f7fa; }
IMPORTANT LIMITATION (BROWSER):
• Chrome/Edge native <select> dropdown styling can be OS-controlled.
• Code is correct, but appearance may vary on some systems.

C) Area / Sector dropdown UI stacking — ✅ DONE (CSS)
File: assets/styles.css (end block)
• Final “AREA DROPDOWN (SINGLE SOURCE OF TRUTH)” block kept at end
• z-index + overflow fixes ensure panel shows above listings


🔢 UPDATED PRIORITY QUEUE (CLEANED)

🟢 PRIORITY 1 — COMPLETED & LOCKED
✅ assets/styles.css
• PRICING — FINAL LOCK stays at VERY END
• Pricing page tested
• Override order stable

🟠 PRIORITY 2 — NEXT STEP (ACTIVE)  ✅ START HERE NEXT
👉 assets/styles.css
• Controlled cleanup of duplicate CSS blocks:
  1) Duplicate “Listings (scoped by .listings-page)” blocks (keep ONE final)
  2) Duplicate Area/Sector dropdown CSS blocks (keep ONE final at end)
Rule:
• One file → one paste box → NO deletions without approval
• ❌ Do NOT touch PRICING — FINAL LOCK block at end

🟡 PRIORITY 3 — LATER (AFTER CSS CLEANUP)
• Listings UI polish (only small safe improvements)
• Card spacing, typography micro-tuning (no rewrites)

🟡 PRIORITY 4 (LATER)
SEO — ONLY after listings UI freeze (explicit ask only)

⚪ FUTURE (DO NOT START)
• Listings API
• Dashboard
• AI Assistant
• Payments
• Analytics


▶️ WHERE WE START NEXT (VERY CLEAR)

👉 assets/styles.css
Step: Remove duplicate Listings + Area dropdown CSS blocks
Rule: Keep ONE final block for each (single source of truth)
Pricing lock must remain last line of file


📝 PENDING (LATER — DO NOT FORGET)

• Listing status workflow: Auto-hide when rented
• Owner renewal reminder → “Mark as Rented / Still Available”
• User “Report Already Rented” request option
• Owner verify-confirm link flow (token-based)
• SMS / WhatsApp templates (≈5) — approval required


✅ END — MASTER FILE v6.5

🔒 CONFIRMED
Nothing important deleted.
Only DONE items locked.
Next step unambiguous.
