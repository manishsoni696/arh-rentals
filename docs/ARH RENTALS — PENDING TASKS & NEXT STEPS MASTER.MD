🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v7.0)

Last Updated: Jan 2026 (Jan 9, 2026)
Note: v6.9 core content retained.
Sirf Post Property (Owner) + Dashboard + Backend Phase additions reflected.
❌ Koi locked business / Listings UI / Pricing / Demo section change nahi hua.

🟡 Post Property (Owner) Page — Frontend

Status: IN PROGRESS (ACTIVE)

✅ CONFIRMED WORKING — STATUS UPDATE (STABLE)
✅ Access & Gating (LOCKED)

✅ PIN Code check correctly work kar raha hai

✅ PIN verify ke baad hi Property Details form unlock hota hai

✅ Phone number / OTP PIN ke baad hi maanga jata hai

✅ PIN Backend Trigger (LOCKED)

Enter key press on PIN input ✅

“Check PIN” button click ✅

📌 Note:
Ye behavior fully verified hai.
👉 Koi core auth change required nahi hai.

📁 Post Property Module — FILE STRUCTURE

Status: ADDED, ACTIVE & CONFIRMED (LOCKED)

post/index.html

Purpose: HTML skeleton + complete form markup

🔒 Rule: ❌ No big inline JS

assets/post-property.js

Purpose (single source): form logic, local draft, amenities render, photo validation, submit handling, auth-gate UI (PIN/OTP layer only)

🔒 Rule: ❌ core auth touch nahi karega; relies on assets/app.js

assets/styles.css (Scoped)

Purpose: Post Property UI styling only

🔒 Rule: .post-page { ... } scoped; Pricing FINAL LOCK untouched & last

✅ NEW LOCKED DECISIONS (ADDED)
🔒 Plans Flow (LOCKED)

✅ PIN + OTP login ke baad direct Property Details form open hoga

✅ Plans / payment form submit ke baad show honge

❌ Plans form se pehle nahi dikhaye jaayenge

🔒 Cloud Draft (Cross-device) — LOCKED RULES

Cloud draft save sirf PIN ✅ + OTP ✅ ke baad

Draft identity = logged-in mobile number

Draft scope = 1 draft per mobile (LOCKED)

Storage = Cloudflare D1 (LOCKED)

Retention = 3 days (LOCKED) → auto-delete after expiry

Restore flow:

PIN ✅ → OTP ✅ → draft check

Draft found → Restore / Discard

No draft → normal form

Logout se cloud draft delete nahi hoga (only discard or auto-expiry)

🔒 Photos Backend Storage Structure (LOCKED)

Storage = Cloudflare R2

Folder-wise per listing:

photos/{listingId}/{uuid}.{ext}

UUID filenames mandatory

Original filenames reuse nahi honge

🧾 CHANGE LOG — Post Property & Auth UX

Date: Jan 9, 2026
Status: 🟡 Active (Frontend finalize pending)

✅ COMPLETED & CONFIRMED (CLEANED)
🔐 Auth & Session UX (LOCKED)

Logged-in status moved to GLOBAL HEADER (masked phone)

Header dropdown becomes active immediately after login on same page

Logout only in header

Logout from dashboard redirects out instantly (protected route guard enforced)

🔐 Post Property Logout Reset (FIXED)

Logout on Post page:

PIN cleared

Phone cleared

OTP cleared

OTP step hidden

Form locked again

Local draft not deleted automatically

🔐 OTP UX Improvements (FIXED)

OTP verify: button click ✅ + Enter key ✅

OTP resend timer resets on logout; quick login-logout me timer stuck nahi hota

🟢 Dashboard — UI

Status: ✅ COMPLETED & LOCKED (NEW)

Dashboard UI upgraded (no longer plain)

Subtitle locked:

“Access and manage rental listings linked to this mobile number.”

Quick cards + empty state finalized

No further dashboard UI changes unless explicitly unlocked

🟡 PENDING (FRONTEND MUST-FIX BEFORE MERGE)

❌ Remove inline JS from post/index.html

❌ Amenities list must reuse FINAL amenities from Listings Filters

❌ Add <body class="post-page"> for scoped CSS

❌ City value must be “Hisar” (Phase-1 only)

❌ Property Type option values:

contract-stable enums (backend safe)

user-friendly labels

🟠 NEXT PHASE (BACKEND INTEGRATIONS) — ADDED
🟠 Phase-1: Backend Upload Link (NO compression)

Goal: Real backend upload pipeline live

R2 pre-signed upload (/api/uploads/init)

Direct upload to R2

Listing create (/api/listings/create) saves photo keys

Server-side re-validation (type/size/count)

Partial upload fail → listing NOT created

❌ No compression in Phase-1 (LOCKED)

🟠 Phase-1B: Cloud Draft Backend (D1)

Goal: Cross-device draft restore

/api/drafts/save (upsert 1 draft per mobile)

/api/drafts/latest (restore prompt)

/api/drafts/delete (discard)

Expiry cleanup (3 days) enforced

🔒 Phase-2 (Later): Photo Compression (500KB target)

LOCKED FOR LATER — Do not implement now

After Phase-1 stable, backend will generate compressed variant (~500KB max target)

🟡 PLANNED — AFTER FRONTEND FINALIZE
Post Property Form Fields Changes (PLANNED)

Scope: Frontend only (fields/labels/options/validations)
📌 Pending input required: exact field list changes

✅ END — v7.0 MASTER UPDATE CONFIRMED
🔐 CONFIRMATIONS

❌ No business wording changes

❌ No core auth changes

❌ Listings / Filters / Demo untouched

✅ Scoped CSS safe

✅ Modular Post Property structure active

✅ Dashboard UI locked
