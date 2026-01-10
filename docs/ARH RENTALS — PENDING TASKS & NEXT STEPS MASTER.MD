🔐 ARH RENTALS — MASTER TASKS & STATUS (v7.2)

Last Updated: Jan 10, 2026
Scope: Post Property (Owner) + Dashboard + Backend
❌ Listings / Pricing / Demo / Business wording untouched

🧱 GLOBAL STATUS (NON-NEGOTIABLE)

✅ Static Frontend (GitHub Pages)

✅ Backend: Cloudflare Workers (native only)

🔒 Core Auth / Pricing / Legal — LOCKED

🔒 Responsive (Desktop + Tablet + Mobile) — MANDATORY

🔐 AUTH & SESSION (GLOBAL) — 🔒 LOCKED
✅ COMPLETED

PIN → OTP flow stable

OTP via button + Enter key

Logged-in state in GLOBAL HEADER

Masked phone shown

Header dropdown active immediately

Logout only via header

Protected routes enforce redirect

🔒 OTP UX — FINAL

OTP resend timer phone-number scoped

Phone change → timer reset instantly

Refresh → timer persists only for same number

❌ No stuck timer

❌ No global bleed

🟡 POST PROPERTY (OWNER) — FRONTEND
STATUS: IN PROGRESS
✅ CONFIRMED & LOCKED

PIN verify ke baad hi form unlock

OTP PIN ke baad hi maanga jata hai

Core auth untouched

Logout resets:

PIN, Phone, OTP cleared

Form locked

Draft retained

📁 POST PROPERTY MODULE — 🔒 STRUCTURE LOCKED

/post/index.html

HTML skeleton + markup only

❌ No inline JS

/assets/post-property.js

Single source:

Form logic

Amenities render

Photo validation

Submit

Cloud draft UI logic

❌ Core auth touch nahi karega

/assets/styles.css

.post-page {} scoped only

Pricing FINAL LOCK untouched

🟡 FRONTEND — PENDING (ONLY THESE)

❌ Remove remaining inline JS from /post/index.html

❌ Amenities reuse FINAL Listings Filters amenities

❌ Add <body class="post-page">

❌ City hard-lock = Hisar

❌ Property Type enums (backend-safe) + friendly labels

🟢 DASHBOARD — UI
STATUS: COMPLETED & 🔒 LOCKED

UI upgraded

Subtitle locked:

“Access and manage rental listings linked to this mobile number.”

No UI changes allowed

☁️ CLOUD DRAFT — 🔒 FINALIZED FEATURE
✅ COMPLETED & LOCKED

Rules

Save allowed only after PIN + OTP

Identity = logged-in mobile

1 draft per mobile

Storage = Cloudflare D1

Retention = 3 days (auto-expiry)

Logout does NOT delete draft

🔄 Restore Flow

PIN → OTP → draft check
Draft found → Restore / Discard
No draft → normal form

🧾 CLOUD DRAFT — TECH (LOCKED REFERENCE)
D1 Table: drafts

mobile

draft_json

updated_at

expires_at

Indexes:

idx_drafts_mobile

idx_drafts_expires

🌐 BACKEND — WORKERS
🔒 ARCHITECTURE LOCKED

Cloudflare Workers ONLY

❌ No Express / Node

D1 + R2 only

🟠 BACKEND PHASE-1 — IN PROGRESS
Photo Upload (NO Compression)

/api/uploads/init → presigned

Direct R2 upload

/api/listings/create

Server re-validation

Partial fail → listing NOT created

❌ Compression NOT allowed

🟠 BACKEND PHASE-1B — IN PROGRESS
Cloud Draft APIs

/api/drafts/save

/api/drafts/latest

/api/drafts/delete

Auto-cleanup after 3 days

🔒 PHASE-2 (LATER)

Image compression (~500KB)

❌ Do not implement now

🔐 CLOUDFARE WORKERS — LOCKED COMPONENTS
🔒 Worker: arh-dashboard

URL: https://arh-dashboard.manishsoni696.workers.dev

Purpose: Dashboard + Draft APIs

❌ Not default API base unless explicitly allowed

🔒 Worker: arh-backend

Allowed in CSP

Primary backend API

🔐 SECURITY (LOCKED)
CSP

connect-src allows:

arh-backend

arh-dashboard

CORS

Dynamic origin allowlist

All jsonResponse() updated

🕒 AUTO-LOGOUT — 🔒 DECISION LOCKED
OPTION-2 (FINAL)

Frontend: lastActivityAt (localStorage)

Backend: token expiry (Workers)

Browser close → next open = immediate logout

❌ No popups / alerts

Silent logout only

📊 SESSION TRACKING — ACTIVE

sessions table exists in D1

Backend can check:

Active sessions

Logout time

Expired sessions

Last seen

(SQL queries already verified)

⏳ PLANNED (AFTER FRONTEND FINALIZE)

Post Property field changes

Local draft autosave

Draft versioning

Draft photo preview

Admin session dashboard

✅ FINAL CONFIRMATIONS — 🔒 LOCKED

❌ No business wording change

❌ No listings / filters / demo change

❌ No core auth change

✅ Scoped CSS safe

✅ Modular architecture stable
