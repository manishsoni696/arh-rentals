🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v6.7)

Last Updated: Jan 2026 (Jan 7, 2026)

OVERALL GOAL (NON-NEGOTIABLE — 🔒 LOCKED)

✅ Website visually premium
✅ Fast load (no bloat, no over-engineering)
✅ SEO-friendly (ONLY when explicitly asked)
✅ Mobile + Tablet + Desktop PERFECT (🔒 LOCKED FOREVER)
✅ No technical compromise at any layer

OVERALL PROJECT STATUS (CURRENT)

🔒 Core System: STABLE & LOCKED
🔒 Listings UI & Filters: FINAL & LOCKED
🟢 Content & Messaging: COMPLETED & LOCKED
🟠 styles.css Cleanup: PENDING (HIGH PRIORITY)
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

🟢 CONTENT PHASE — COMPLETED & LOCKED

11. LISTINGS PAGE CONTENT — 🔒 LOCKED
    • Top Info Strip (English)
    • Tenant Advisory (single-line)
    • Listing Expiry / Auto-Hide Notice

Note:
“Content finalized. No wording changes allowed unless explicitly unlocked by owner.”

12. OWNER COMMUNICATION MESSAGES — 🔒 LOCKED
    • Property Listed Confirmation
    • Expiry Reminder
    • Post-Expiry Auto-Hide Message

Note:
“Content finalized. No wording changes allowed unless explicitly unlocked by owner.”

🔒 LISTINGS PAGE — FINAL LOCK
⚠️ No UI, filter, demo, or content changes allowed unless explicitly unlocked

🔢 NEXT STEPS (VERY CLEAR)

👉 NEXT PRIORITY (ACTIVE):
styles.css cleanup — duplicate Listings & Area dropdown CSS blocks
• Performance-only cleanup
• No UI change
• No layout change
• Pricing FINAL LOCK must remain last

🚫 DO NOT START
• SEO
• Backend / API
• Dashboard
• Payments
• AI Assistant
• Analytics

📝 PENDING (LATER — REFERENCE ONLY)
• Listing status workflow — STEP 2 (Not Available reports, auto-pause, owner re-confirm)
• Owner renewal reminder → “Still Available / Rented”
• User “Report Already Rented” option (UI)
• Owner verify-confirm link (token-based)
• SMS / WhatsApp templates (≈5) — approval required

🧾 CHANGE LOG (LATEST)

🔐 Listings Page Content & Owner Communication — ✅ COMPLETED & LOCKED
Date: Jan 2026

1. Listings Page — Top Info Strip (CONTENT FINALIZED)
   • Clarifies listings are posted by property owners in Hisar
   • ARH Rentals positioned strictly as an information-access platform
   • Owner–Tenant direct dealing clearly stated

Final Locked Text:
“This page displays rental listings posted by property owners in Hisar.
ARH Rentals provides access to property information only.
All property-related dealings take place directly between the owner and the tenant.”

2. Tenant Advisory Notice (CONTENT FINALIZED)
   • Tenant self-verification responsibility stated
   • Zero responsibility model reinforced

Final Locked Text:
“Tenants are advised to personally verify property details, location, rent terms, and documents before finalizing.”

3. Listing Expiry / Auto-Hide Notice (CONTENT FINALIZED)
   • Transparent visibility rules
   • No pressure or guarantee language

Final Locked Text:
“Listings automatically become hidden after expiry if not renewed by the owner.”

4. Owner Communication — Property Listed Confirmation (LOCKED)

Final Locked Text:
“Your property listing has been successfully published on ARH Rentals.
The listing will remain visible until its expiry date unless renewed.
Please note that all rental discussions take place directly between you and the tenant.”

5. Owner Communication — Expiry Reminder (LOCKED)

Final Locked Text:
“Reminder: Your property listing on ARH Rentals is nearing its expiry date.
You may renew the listing to keep it visible on the platform.”

6. Owner Communication — Post-Expiry Auto-Hide Message (LOCKED)

Final Locked Text:
“Your property listing on ARH Rentals has expired and is now hidden.
You can renew the listing to make it visible again.”

LOCKED RULES CONFIRMED:
• No responsibility, no verification, no guarantees implied
• No banned words used (Verified / Trusted / Approved / Guaranteed)
• Content suitable for Website, SMS, WhatsApp, Email
• Any future wording change requires explicit owner unlock

🔧 Backend Module — Owner Property Image Upload — ✅ SAFE TO MERGE
Date: Jan 2026

1. New Service Added
   backend/services/propertyImageStore.js
   • Server-side trusted image count implemented
   • getExistingPropertyImageCount(propertyId) introduced
   • Client-side spoofing eliminated
   • Sanitized propertyId + path traversal protection
   • Returns 0 if property has no images
   • Throws IMG_003 on processing failure

2. Route Updated
   backend/routes/propertyImages.js
   • Integrated server-side image count check
   • Enforced max 10 images per property (end-to-end)
   • Strict MIME validation: image/jpeg, image/png only
   • Centralized error handling:
   IMG_001 invalid format
   IMG_002 size too large
   IMG_003 processing failed
   IMG_004 max image count exceeded
   • No UI / SEO / business text changes

3. Image Processing Confirmed
   backend/services/imageProcessor.js
   • Input hard limit: 1 MB per image
   • Resize max 1600px (aspect ratio preserved)
   • Compression target ~500 KB (300–600 KB)
   • Mandatory watermark: “ARH Rentals” bottom-right (~0.25 opacity)
   • Unique filenames
   • property_id based storage folders

4. Contracts Finalized
   backend/contracts/image-upload.rules.json
   • Authoritative rules for formats, size, compression, watermark, errors

backend/contracts/property.schema.json
• Amenities validation aligned
• Max 10 images enforced

5. Security & Abuse Prevention
   • Client-side image count spoofing eliminated
   • Path traversal protection added
   • Memory upload limits enforced
   • Controlled error exposure (no leakage)

Final Outcome:
• Backend image upload flow secure & production-ready
• Zero-responsibility model intact
• No impact on Listings UI, SEO, or locked content

Status Workflow — STEP 1 (Logic Draft) ✅
• Defined listing status states: Active, Rented, Expired, Paused
• Finalized visibility rule (active + within expiry only)
• Defined auto & manual status change triggers
• No UI or backend changes made

Status Workflow — STEP 2 (Logic Draft) ⏸️ PARKED
• Tenant “Not Available / Already Rented” reporting logic drafted
• Auto-pause threshold logic defined (2 reports / 7 days)
• Owner re-confirm options defined (Reactivate / Close)
• Anti-spam cooldown rule outlined
• Moved to PENDING (future implementation)

✅ END — MASTER FILE v6.7 (UPDATED)

🔒 CONFIRMED
Backend image upload module logged and locked.
No UI, wording, or business rules altered.
