🔐 ARH RENTALS — UPDATED MASTER (TASK 2 SOLVED + TRANSPARENCY PLANNING)

Last Updated: Jan 2026
Status: 🔒 LOCKED CORE + ✅ Pricing Selection Fixed + 🟡 Broker Transparency Planned

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

5) OTP LOGIN SYSTEM (CURRENTLY IMPLEMENTED)
5.1 PURPOSE (🔒 LOCKED)

OTP is ONLY for login/session (phone ownership confirmation).
OTP is NOT verification of owner or property.

5.2 FLOW (SUMMARY)

PIN check (Hisar only)

Send OTP

Verify OTP

Session token stored → localStorage.arh_token

5.3 OTP RULES (🔒 LOCKED)

60 sec resend cooldown

Max 3 OTP in 4 hours per number

OTP valid for 5 minutes

Token stored locally

5.4 FRONTEND STORAGE KEYS (🔒 LOCKED)

localStorage

arh_token

arh_otp_cooldown_until

arh_otp_lock_until

arh_otp_sent_once_<mobile>

sessionStorage

arh_pincode

arh_mobile

6) FRONTEND FILE STRUCTURE (LIVE)
/index.html              → Home
/listings/index.html     → Listings
/pricing/index.html      → Plans
/post/index.html         → Post flow (PIN + OTP)
/legal/index.html        → Legal & disclaimers

/assets/
  app.js                 → OTP + PIN + pricing logic
  styles.css             → All styling
  arh-logo.png

7) BACKEND (Cloudflare Worker)

Endpoints

GET /check-pincode?pincode=XXXXXX

POST /send-otp

POST /verify-otp

GET /me

Auth

Authorization: Bearer <arh_token>

8) PRICING PAGE — ✅ FIXED (TASK 2 SOLVED)

File: /pricing/index.html

Required DOM (🔒 LOCKED)
<section class="grid-3" id="pricingGrid">
  <article class="card" data-plan="basic|premium|pro">
    <button class="btn btn-primary select-btn" type="button">
      Select Plan
    </button>
  </article>
</section>

Intended Behavior (NOW WORKING)

Card OR button click:

Adds .selected

Button text → Selected

Other cards reset

Default on load:

Premium selected

Fix Applied:
Selected-state CSS placed at END of styles.css as final override.

✅ Selection works
✅ Highlight visible

9) MOBILE MENU STATUS (STABLE)

Works on:

Home ✅

Pricing ✅

Listings ✅

Legal ✅

Strategy (🔒 LOCKED):

❌ No HTML restructure

❌ No new toggle JS

✅ CSS-only visibility using body.nav-open

10) LEGAL PAGE — FINAL (READY)

File: /legal/index.html

Content remains as locked master

Disclaimer usage mandatory

11) NEXT PHASE (REFERENCE ONLY — NOT IMPLEMENTED)

Tables created: payments, credits, listings, users, sessions, otps

Payment → 1 credit → publish consumes credit

Expiry cron → future

12) UPDATED PENDING TASKS (PRIORITY ORDER)
🔴 PRIORITY 1 — STABILITY & SAFETY

Freeze CSS base (add-only)

Session & OTP backend validation

Post flow validation & error feedback

🟠 PRIORITY 2 — CORE BUSINESS PAGES

Legal page linking + footer path fixes

Plans page copy polish (clarity + CTA intent)

🟡 PRIORITY 3 — SEO & DISCOVERABILITY

Google Search Console review

On-page SEO audit

🔵 PRIORITY 4 — UX BOOSTERS

WhatsApp / Call CTA logic

Micro-UX consistency (hover / disabled / loading)

⚪ PRIORITY 5 — FUTURE (DO NOT START)

Dashboard

AI listing assistant

Subscriptions

Analytics

13) BROKER-LISTED PROPERTY TRANSPARENCY (NEW — PLANNED)
13.1 PROBLEM STATEMENT

Sometimes a tenant unlocks contact and discovers:

Property was posted by a broker

Caller is not the owner

This reduces trust and conflicts with ARH Rentals’ goal:
Genuine Owner ↔ Genuine Tenant

13.2 CORE PRINCIPLE (🔒 LOCKED)

ARH Rentals will NOT auto-block brokers,
but will enforce transparent disclosure when identified.

No silent allowance.
No false owner positioning.

13.3 USER-REPORTED BROKER FLAG

Tenants may optionally mark:

“This property is listed by a broker, not an owner”

Purpose:

Transparency only

No accusation

No penalty

13.4 LISTING VISIBILITY TAG

After threshold (future logic):

⚠️ This property is listed by a broker, not directly by the owner

Neutral language only.
No verification claim.

13.5 DISCLAIMER WITH TAG (MANDATORY)

ARH Rentals does not verify whether a listing is posted by an owner or broker.
This label is based on user feedback and shown for transparency only.

13.6 INTERNAL SIGNALS (FUTURE — INDICATIVE ONLY)

Multiple tenant reports

Same phone posting many listings

High-volume posting patterns

⚠️ Indicators only — NOT proof

13.7 BUSINESS & LEGAL SAFETY

✔ Zero-responsibility model preserved
✔ No verification burden
✔ No legal exposure
✔ Improves trust naturally

13.8 UI / UX IDEA (FUTURE)

Small ⚠️ info badge

Grey (not red)

Tooltip explanation

Visible before contact unlock

❌ No popups
❌ No blocking
❌ No warnings

13.9 OPTIONAL FUTURE IDEAS (REFERENCE ONLY)

“Owner-posted” self-declaration checkbox

Owner-like / Agent-like confidence hint

Filter: “Prefer owner-posted listings”

⚠️ None active or promised

13.10 STATUS

🟡 PLANNED — NOT IMPLEMENTED
🟡 Logic & UX to be refined later
🟡 May evolve with better data

🔒 FINAL LOCK NOTE

This transparency feature:

Does NOT certify owners

Does NOT verify listings

Does NOT change ARH Rentals’ legal position

It exists only to improve user awareness.
