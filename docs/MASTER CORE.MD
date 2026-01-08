🔐 ARH RENTALS — UPDATED MASTER CORE

(Global Login + Dashboard + Modular Post Property Structure Integrated)

Last Updated: Jan 2026
Status: 🔒 CORE LOCKED + 🔒 POST-UNLOCK RULES LOCKED + 🔒 PRE-UNLOCK POPUP LOCKED

0) PROJECT IDENTITY

Project: ARH Rentals
Brand / Owner: Anjani Real Heights
Website: https://rent.anjanirealheights.com

Location Focus (Phase-1): Hisar

Platform Type:
Rental advertisement + information-access platform

❌ NOT a broker
❌ NOT a mediator
❌ NOT a verifier

1) CORE BUSINESS MODEL (NON-NEGOTIABLE)
1.1 ZERO RESPONSIBILITY MODEL (🔒 LOCKED)

ARH Rentals ONLY publishes rental advertisements (posted by users).

We DO NOT:

Verify property

Verify owner or tenant

Verify documents

Guarantee deal success

Guarantee tenant availability

Guarantee lead quality / calls / conversions

Approve or validate listings

1.2 STRICT WORD BAN (GLOBAL — 🔒 LOCKED)

❌ Never use anywhere:

Verified

Trusted

Approved

Guaranteed

Assured

Confirmed

Safe Deal

✅ Allowed safe wording:

Owner-posted

Advertisement

Listing platform

Information access only

Users must independently verify

1.3 MANDATORY DISCLAIMER (USE EVERYWHERE — 🔒 LOCKED)

ARH Rentals is an information-access platform only.
Property details are posted directly by users.
Users must independently verify all details before any transaction.
ARH Rentals does not guarantee tenant availability or deal success.

2) USER TYPES (🔒 LOCKED)
A) OWNER (Property Poster)

OTP login required

Each property requires separate plan/payment

Same phone posting 2 properties ⇒ 2 payments

Plans are property-level, NOT user-level

B) TENANT / SEEKER (Viewer)

Browse listings (public)

Contact unlock = future paid feature

Must verify independently

3) LIVE OWNER PLANS & PRICING (🔒 LOCKED)
Plan	Price	Validity	Listings
Basic	₹199	15 days	1 property
Premium	₹349	30 days	1 property
Pro	₹599	60 days	1 property

Rules:

No unlimited listings

No lifetime plans

Expiry hides listing automatically

4) LISTING EXPIRY / DELETE POLICY (🔒 LOCKED)

On plan expiry → listing becomes hidden

Soft delete using deleted_at

Hard delete buffer (7–15 days) → future decision

5) OTP LOGIN SYSTEM (CURRENT — 🔒 LOCKED)
5.1 PURPOSE

OTP is ONLY for login/session (phone ownership confirmation).
OTP is NOT verification of owner or property.

5.2 FLOW

PIN check (Hisar only)

Send OTP

Verify OTP

Session token → localStorage.arh_token

5.3 OTP RULES

60 sec resend cooldown

Max 3 OTP in 4 hours per number

OTP valid for 5 minutes

5.4 FRONTEND STORAGE KEYS (LOCKED)

localStorage

arh_token

arh_otp_cooldown_until

arh_otp_lock_until

arh_otp_sent_once_<mobile>

sessionStorage

arh_pincode

arh_mobile

5A) GLOBAL LOGIN SYSTEM + DASHBOARD (NEW — 🔒 LOCKED)
5A.1 PURPOSE

Hisar eligibility enforce karna

Owners ko apni sari listings ek jagah dikhana

OTP ko sirf login/session tak limit rakhna

❌ Verification nahi
❌ Ownership certification nahi

5A.2 MANDATORY ACCESS FLOW

Strict order (non-negotiable):

PIN Code Check (Hisar only)

Mobile + OTP Login

Dashboard Access

❌ PIN ke bina login nahi
❌ Login ke bina dashboard nahi

5A.3 DIRECT /dashboard ACCESS GUARDS

PIN missing → PIN Gate redirect

PIN ok, token missing/invalid → OTP login

PIN + valid token → Dashboard open

5A.4 DASHBOARD SCOPE (LOCKED)

Default View: My Listings

Filter: owner_mobile = logged-in mobile

Show:

Plan type

Expiry date

Status:

Active

Hidden (expired)

Rented / Not available (future)

Rules:

Same mobile = multiple listings allowed

Each listing = separate plan

Expired listings:

Public → hidden

Dashboard → visible

5A.5 DASHBOARD ACTIONS

Post New Property → /post

Renew property (property-specific)

View listing status

❌ No verification
❌ No guarantees

5A.6 DASHBOARD FILE STRUCTURE
/dashboard/index.html
/assets/dashboard.js


Rules:

❌ No inline JS

✅ Existing auth/session via assets/app.js

6) FRONTEND FILE STRUCTURE (LIVE)
/index.html              → Home
/listings/index.html     → Listings
/pricing/index.html      → Plans
/post/index.html         → Post Property (PIN + OTP)
/dashboard/index.html    → Owner Dashboard
/legal/index.html        → Legal & disclaimers

/assets/
  app.js                 → Global auth / PIN / OTP / nav (LOCKED)
  post-property.js       → Post Property module JS
  dashboard.js           → Dashboard logic
  styles.css             → All styling (scoped rules)
  arh-logo.png

7) BACKEND (Cloudflare Worker)

Endpoints:

GET /check-pincode?pincode=XXXXXX

POST /send-otp

POST /verify-otp

GET /me

Auth:

Authorization: Bearer <arh_token>

8) PRICING PAGE — ✅ FIXED (TASK 2 SOLVED)

(No change — LOCKED & WORKING)

9) MOBILE MENU STATUS (🔒 LOCKED & STABLE)

CSS-only using body.nav-open

❌ No HTML restructure

❌ No new JS toggle

10) LEGAL PAGE — FINAL (🔒 LOCKED)

/legal/index.html

Disclaimer mandatory

Copy frozen

11) 📁 POST PROPERTY MODULE — MODULAR STRUCTURE (NEW — 🔒 LOCKED)
Files
/post/index.html

HTML skeleton + complete form markup

❌ No big inline JS

/assets/post-property.js

Single-source JS for:

Form logic

Draft save / restore

Amenities rendering

Photo validation

Frontend submit handling

Rules:

❌ Core auth logic touch nahi karega

✅ assets/app.js par rely karega

/assets/styles.css (Scoped)

.post-page { … } only

❌ Other pages affected nahi honge

🔒 Pricing FINAL LOCK block file ke end me untouched

WHY THIS STRUCTURE (RATIONALE — LOCKED)

Inline JS removal discipline

Clear separation of concerns

CSS isolation

Zero cross-page risk

Future backend-ready

12) UPDATED PENDING TASKS (UNCHANGED)

Priority list same as before
(Dashboard implementation future phase)

🔒 FINAL MASTER CONFIRMATION

Zero Responsibility Model intact

No verification / guarantee introduced

Dashboard = convenience layer only

All LOCKED wording & intent preserved
