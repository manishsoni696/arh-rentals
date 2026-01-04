✅ ARH RENTALS — UPDATED MASTER (TASK 2 SOLVED)

Last Updated: Jan 2026
Status: 🔒 LOCKED CORE + ✅ Pricing Selection Fixed

0) PROJECT IDENTITY

Project: ARH Rentals

Brand/Owner: Anjani Real Heights

Website: https://rent.anjanirealheights.com

Location Focus (Phase-1): Hisar

Type: Rental advertisement + information-access platform

NOT a broker

NOT a mediator

NOT a verifier

1) CORE BUSINESS MODEL (NON-NEGOTIABLE)
1.1 ZERO RESPONSIBILITY MODEL (LOCKED)

ARH Rentals ONLY publishes rental ads (owner-posted).

We DO NOT:

verify property / owner / tenant

verify documents

guarantee deal success

guarantee tenant availability

guarantee lead quality / calls / conversions

approve / validate listings

1.2 STRICT WORD BAN (GLOBAL)

NEVER use these words anywhere:

Verified, Trusted, Approved, Guaranteed, Assured, Confirmed, Safe Deal

Allowed safe wording:

Owner-posted

Advertisement

Listing platform

Information access only

Users must independently verify

1.3 MANDATORY DISCLAIMER (USE EVERYWHERE)

ARH Rentals is an information-access platform only.
Property details are posted directly by owners.
Users must independently verify all details before any transaction.
ARH Rentals does not guarantee tenant availability or deal success.

2) USER TYPES (LOCKED)

A) OWNER (Property Poster)

OTP login required

Each property requires separate plan/payment

Same phone posting 2 properties ⇒ 2 payments

Plans are property-level, NOT user-level

B) TENANT / SEEKER (Viewer)

Browse listings (public)

Contact unlock / details unlock = future paid feature

Must verify independently

3) LIVE OWNER PLANS & PRICING (LOCKED)

1 plan = 1 property listing

Plan	Price	Validity	Listings
Basic	₹199	15 days	1 property
Premium	₹349	30 days	1 property
Pro	₹599	60 days	1 property

Rules:

No unlimited listings

No lifetime plans

Expiry hides listing automatically

4) LISTING EXPIRY / DELETE POLICY (LOCKED)

On plan expiry: listing becomes hidden (not visible)

Soft delete: deleted_at

Hard delete buffer (7–15 days): future decision

5) OTP LOGIN SYSTEM (CURRENTLY IMPLEMENTED)
5.1 PURPOSE (LOCKED)

OTP is ONLY for login/session (phone ownership confirmation).
OTP is NOT verification/approval of owner/property.

5.2 FLOW (SUMMARY)

PIN check (Hisar only)

Send OTP

Verify OTP

Session token stored: localStorage.arh_token

5.3 OTP RULES (LOCKED)

60 sec resend cooldown

Max 3 OTP in 4 hours per number

OTP valid for 5 minutes

Token stored locally

5.4 FRONTEND STORAGE KEYS (LOCKED)

localStorage:

arh_token

arh_otp_cooldown_until

arh_otp_lock_until

arh_otp_sent_once_<mobile>

sessionStorage:

arh_pincode

arh_mobile

6) FRONTEND FILE STRUCTURE (LIVE)

/index.html → Home

/listings/index.html → Listings

/pricing/index.html → Plans (pricing UI)

/post/index.html → Post flow (PIN + OTP)

/legal/index.html → Legal + disclaimers

/assets/

app.js → OTP + PIN + pricing selection logic

styles.css → All styling

arh-logo.png

7) BACKEND (Cloudflare Worker) — CURRENT + ROUTES

Endpoints:

GET /check-pincode?pincode=XXXXXX

POST /send-otp

POST /verify-otp

GET /me (Bearer token)

Auth:

Authorization: Bearer <arh_token>

8) PRICING PAGE — ✅ FIXED (TASK 2 SOLVED)

File: /pricing/index.html

Required DOM (LOCKED)

<section class="grid-3" id="pricingGrid">

<article class="card" data-plan="basic|premium|pro">

button: <button class="btn btn-primary select-btn" type="button">Select Plan</button>

Intended behavior (NOW WORKING)

Card OR button click:

Adds .selected to that card

Selected card button text → “Selected”

Other cards button text → “Select Plan”

Default on load:

Premium selected

Previous known issue (RESOLVED)

JS executed + DOM found + .selected applied

But visual highlight not visible

Root cause: CSS override ordering/selector priority

Fix: selected highlight CSS kept at END of styles.css as “final winning override”

✅ Current status: Selection works + highlight visible

9) MOBILE MENU STATUS (STABLE)

Mobile menu works on:

Home ✅

Pricing ✅

Listings ✅ (acceptable)

Legal ✅ (for now)

Strategy remains:

❌ No HTML restructure

❌ No new toggle JS

✅ CSS controls visibility using body.nav-open + .menu.is-open

10) LEGAL PAGE — FINAL TEXT (READY)

Use on: /legal/index.html

(legal content remains same as locked master)

11) NEXT PHASE (NOT IMPLEMENTED YET) — REFERENCE ONLY

Tables created: payments, credits, listings, users, sessions, otps

Payment → 1 credit → publish consumes credit

Expiry job future

12) UPDATED PENDING TASKS (NEW PRIORITY ORDER)
🔴 PRIORITY 1 — STABILITY & SAFETY

Freeze CSS Base (locked add-only)

Session & OTP Backend Validation

Contact/Post page validation & feedback audit

🟠 PRIORITY 2 — CORE BUSINESS PAGES

Legal page linking + footer path correctness

Plans page copy polish (clarity & CTA intent)

🟡 PRIORITY 3 — SEO & DISCOVERABILITY

Google Search Console review

On-page SEO audit

🔵 PRIORITY 4 — UX BOOSTERS

WhatsApp/Call CTA logic

Micro UX improvements (loading/disabled/hover consistency)

⚪ PRIORITY 5 — FUTURE (DO NOT START YET)

Customer dashboard

AI listing assistant

Subscription automation

Analytics & event tracking
