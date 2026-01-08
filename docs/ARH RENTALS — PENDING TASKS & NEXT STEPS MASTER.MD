🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v7.1)

Last Updated: Jan 9, 2026
Based on: v7.0 (cleaned & consolidated)
Scope: Post Property (Owner) + Dashboard + Backend only
❌ Listings UI / Pricing / Demo / Business wording untouched

🧱 GLOBAL STATUS (NON-NEGOTIABLE)

✅ Static Frontend (GitHub Pages) — ACTIVE
✅ Backend = Cloudflare Workers (native only)
✅ Core Auth / Pricing / Legal — 🔒 LOCKED
✅ Responsive (Desktop + Tablet + Mobile) — 🔒 MANDATORY

🟡 POST PROPERTY (OWNER) — FRONTEND
STATUS: IN PROGRESS (ACTIVE)
✅ CONFIRMED & VERIFIED — 🔒 LOCKED
🔐 Access & Gating (STABLE)

✅ PIN Code check working

✅ PIN verify ke baad hi Property Details unlock

✅ Phone number + OTP PIN ke baad hi maanga jata hai

✅ PIN backend trigger:

Enter key press ✅

“Check PIN” button click ✅

📌 NOTE (LOCKED)
Core auth logic bilkul sahi hai
👉 ❌ Koi auth change allowed nahi

📁 POST PROPERTY MODULE — FILE STRUCTURE (LOCKED)
/post/index.html

Purpose: HTML skeleton + complete form markup

🔒 Rule: ❌ No big inline JS

/assets/post-property.js

Purpose (single source):

Form logic

Local draft

Amenities render

Photo validation

Submit handling

PIN/OTP UI layer only

🔒 Rule: ❌ Core auth touch nahi karega

Depends on: /assets/app.js

/assets/styles.css

Post page styles scoped only

🔒 Rule:

.post-page { ... } only

Pricing FINAL LOCK block last & untouched

🔒 LOCKED FLOW DECISIONS (FINAL)
🧾 Plans Flow

✅ PIN + OTP ke baad direct Property Details

✅ Plans / Payment submit ke baad show honge

❌ Plans pehle nahi dikhenge

🔒 CLOUD DRAFT — FINAL RULES

Save allowed only after: PIN ✅ + OTP ✅

Draft identity = logged-in mobile number

Draft scope = 1 draft per mobile

Storage = Cloudflare D1

Retention = 3 days (auto delete)

Restore Flow

PIN → OTP → draft check

Draft found → Restore / Discard

No draft → normal form

📌 Logout par draft delete nahi hota
(only discard or auto-expiry)

🔒 PHOTOS — BACKEND STORAGE STRUCTURE

Storage: Cloudflare R2

Path:

photos/{listingId}/{uuid}.{ext}


UUID filenames mandatory

Original filenames reuse ❌

🧾 CHANGE LOG — AUTH & UX (LOCKED)
🔐 Auth / Session UX

Logged-in status → GLOBAL HEADER

Masked phone shown

Header dropdown active immediately after login

Logout only via header

Dashboard logout → instant redirect (guard enforced)

🔐 Post Property Logout Reset

PIN cleared

Phone cleared

OTP cleared

OTP step hidden

Form locked again

Local draft retained

🔐 OTP UX

Verify via button + Enter key

Resend timer resets on logout

Quick login-logout issue fixed

🟢 DASHBOARD — UI
STATUS: COMPLETED & 🔒 LOCKED

Dashboard UI upgraded

Subtitle (LOCKED):

“Access and manage rental listings linked to this mobile number.”

Quick cards + empty state finalized

❌ No UI change allowed unless explicitly unlocked

🟡 PENDING — FRONTEND MUST-FIX (BEFORE MERGE)

⚠️ These are the ONLY active frontend tasks

❌ Remove inline JS from /post/index.html

❌ Amenities list must reuse FINAL Listings Filters amenities

❌ Add <body class="post-page">

❌ City value hard-lock = “Hisar”

❌ Property Type:

Backend-safe enum values

User-friendly labels

🟠 NEXT PHASE — BACKEND (ACTIVE BUT NOT STARTED)
🟠 Phase-1: Photo Upload (NO Compression)

Goal: Real backend upload pipeline

/api/uploads/init → R2 pre-signed upload

Direct upload to R2

/api/listings/create

Server-side re-validation (type/size/count)

Partial upload fail → ❌ listing not created

❌ Compression NOT allowed (LOCKED)

🟠 Phase-1B: Cloud Draft Backend (D1)

/api/drafts/save (upsert)

/api/drafts/latest

/api/drafts/delete

Auto cleanup after 3 days

🔒 Phase-2 (LATER — DO NOT IMPLEMENT NOW)

Photo compression (~500KB target)

Only after Phase-1 stable

🟡 PLANNED (AFTER FRONTEND FINALIZE)
Post Property Form Field Changes

Scope: Frontend only

Fields / labels / validations

📌 Pending exact field list from owner

✅ FINAL CONFIRMATIONS — 🔒 LOCKED

❌ No business wording changes

❌ No core auth changes

❌ Listings / Filters / Demo untouched

✅ Scoped CSS safe

✅ Modular Post Property active

✅ Dashboard UI locked
