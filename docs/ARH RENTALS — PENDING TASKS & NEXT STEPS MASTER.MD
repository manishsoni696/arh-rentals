🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v6.6)

Last Updated: Jan 2026 (Jan 7, 2026)

OVERALL GOAL (NON-NEGOTIABLE — 🔒 LOCKED)

✅ Website visually premium
✅ Fast load (no bloat, no over-engineering)
✅ SEO-friendly (ONLY when explicitly asked)
✅ Mobile + Tablet + Desktop PERFECT (🔒 LOCKED FOREVER)
✅ No technical compromise at any layer

OVERALL PROJECT STATUS (CURRENT)

🔒 Core System: STABLE & LOCKED
🔒 Listings Page UI & Filters: FINAL LOCKED
🔒 Demo Mode (?demo=1): VERIFIED, WORKING & LOCKED
🟢 styles.css: CLEANUP COMPLETED & LOCKED
🟢 Pricing CSS “FINAL LOCK”: DONE & LOCKED (END-OF-FILE CONFIRMED)
🟢 Area / Sector input UX upgrade: DONE & LOCKED
⏳ SEO + Backend planning: DEFERRED (DO NOT TOUCH YET)

✅ COMPLETED & LOCKED (DO NOT TOUCH)

1. WORKING RULES & EXECUTION PROCESS — 🔒 LOCKED
   • Single-chat workflow only
   • One task at a time
   • One file = one step = one paste box
   • Exact change + exact location only
   • Mobile + Tablet + Desktop mandatory (FOREVER)

2. CORE UI FOUNDATION — 🔒 LOCKED
   • Dark SaaS theme finalized
   • Buttons, cards, spacing standardized
   • Visual hierarchy stable

3. MOBILE NAVIGATION — 🔒 LOGIC LOCKED
   Status: ✅ Verified & stable on ALL pages
   Rules (DO NOT CHANGE):
   • JS single source of truth
   • body.nav-open as state
   • .menu.is-open / #primary-navigation.is-open
   • .header-actions visible on mobile
   • .header-cta hidden on mobile
   • .nav-toggle always visible
   File: assets/app.js

4. AUTHENTICATION & SESSIONS — 🔒 LOCKED
   • OTP = session confirmation only
   • PIN login allowed
   • Same-device session supported
   • No misleading language anywhere

5. OTP BACKEND RULES — 🔒 LOCKED
   • Resend cooldown: 60 seconds
   • Max OTP: 3 per 4 hours
   • OTP validity: 5 minutes

6. LEGAL PAGE — 🔒 LOCKED
   • Disclaimer aligned
   • No banned / risky words
   • Responsive verified

7. POST PROPERTY FLOW — 🔒 LOCKED
   Flow: PIN → OTP → Property → Plan
   • No false promises
   • No misleading text

8. HOME PAGE — 🔒 LOCKED
   • UI finalized
   • Responsive verified

9. DEAL UNLOCK RULES (PRE + POST) — 🔒 LOCKED
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

10. BROKER-LISTED TRANSPARENCY RULE — 🔒 LOCKED (REFERENCE)
    • Neutral broker tag (future)
    • Feedback-based transparency only
    • No verification / penalty / guarantee

🔒 LISTINGS PAGE — FINAL LOCK (NO ACTIVE WORK AREA)
⚠️ NO UI / FILTER / DEMO CHANGES ALLOWED BELOW THIS LINE

11. LISTINGS FILTER SYSTEM — 🔒 FINAL LOCK
    ✅ Hybrid Filter Model (LOCKED)
    • Primary Filters: Apply on “Search Properties”
    • Secondary Filters (More Filters): Auto-apply on change
    • No Apply button in secondary filters

12. DEMO MODE — 🔒 FINAL LOCK
    Trigger:
    • URL parameter `?demo=1` only

Features:
• 10 dummy listings (Residential + Commercial)
• Houses, Flats (1/2/3 BHK), PGs, Shops, Offices
• Uses ONLY final-approved amenities
• 3–5 images per listing
• Sticky banner: “🧪 Demo Mode Active” with exit link

Rules:
• Demo OFF by default
• No impact on live users
• Same filter logic as production
• Internal testing only

✅ RECENT CHANGES COMPLETED (LOCKED)

A) Demo Mode Implementation — ✅ DONE
File: assets/app.js
• Demo listings injected
• Conditional activation via `?demo=1`
• Listings logic auto-detects demo vs normal mode

B) Unified Filter Logic Upgrade — ✅ DONE
File: assets/app.js
• Single client-side filter engine
• Supports all primary & secondary filters
• Category-aware amenities filtering
• Accurate “Showing X properties” count

C) Filter UX Enhancement — ✅ DONE
Files: assets/app.js, listings/index.html
• Secondary filters auto-apply
• Apply button removed from More Filters
• Primary filters retain Search button behavior

D) CSS Cleanup — ✅ DONE
File: assets/styles.css
• Duplicate Listings CSS removed
• Duplicate Area/Sector CSS removed
• Pricing FINAL LOCK preserved at end of file

🔢 CURRENT PRIORITY QUEUE

🟢 PRIORITY 1 — COMPLETED & LOCKED
• Listings UI & Filters
• Demo Mode
• CSS Cleanup

🟡 PRIORITY 2 — NEXT (LOGIC ONLY, LATER)
• Listing status workflow (auto-hide when rented)
• Owner renewal reminder (Still Available / Rented)
• User “Report Already Rented” option
• Owner verify-confirm link (token-based)

🟡 PRIORITY 3 — LATER
• Backend data contract (when unlocked)

🚫 DO NOT START
• SEO
• Listings API
• Dashboard
• Payments
• AI Assistant
• Analytics

📝 PENDING (REFERENCE ONLY)
• SMS / WhatsApp templates (≈5) — approval required

✅ END — MASTER FILE v6.6

🔒 CONFIRMED
Listings Page, Filters & Demo Mode are FINAL LOCKED.
No UI or logic changes allowed unless explicitly unlocked by owner.
