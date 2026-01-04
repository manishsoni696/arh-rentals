# 🔐 ARH RENTALS — SINGLE MASTER REFERENCE (DEDUPED)
Last Updated: Jan 2026  
Status: 🔒 LOCKED CORE (Business + OTP + Plans)

---

## 0) PROJECT IDENTITY
- Project: **ARH Rentals**
- Brand/Owner: **Anjani Real Heights**
- Website: https://rent.anjanirealheights.com
- Location Focus (Phase-1): **Hisar**
- Type: **Rental advertisement + information-access platform**
  - NOT a broker
  - NOT a mediator
  - NOT a verifier

---

## 1) CORE BUSINESS MODEL (NON-NEGOTIABLE)
### 1.1 ZERO RESPONSIBILITY MODEL (LOCKED)
ARH Rentals ONLY publishes rental ads (owner-posted).

We DO NOT:
- verify property / owner / tenant
- verify documents
- guarantee deal success
- guarantee tenant availability
- guarantee lead quality / calls / conversions
- approve / validate listings

### 1.2 STRICT WORD BAN (GLOBAL)
NEVER use these words anywhere:
- Verified, Trusted, Approved, Guaranteed, Assured, Confirmed, Safe Deal

Allowed safe wording:
- Owner-posted
- Advertisement
- Listing platform
- Information access only
- Users must independently verify

### 1.3 MANDATORY DISCLAIMER (USE EVERYWHERE)
ARH Rentals is an information-access platform only.  
Property details are posted directly by owners.  
Users must independently verify all details before any transaction.  
ARH Rentals does not guarantee tenant availability or deal success.

---

## 2) USER TYPES (LOCKED)
A) OWNER (Property Poster)
- OTP login required
- Each property requires separate plan/payment
- Same phone posting 2 properties ⇒ 2 payments
- Plans are **property-level**, NOT user-level

B) TENANT / SEEKER (Viewer)
- Browse listings (public)  
- Contact unlock / details unlock = **future paid feature**
- Must verify independently

---

## 3) LIVE OWNER PLANS & PRICING (LOCKED)
1 plan = 1 property listing

| Plan   | Price | Validity | Listings |
|--------|------:|---------:|---------:|
| Basic  | ₹199  | 15 days  | 1 property |
| Premium| ₹349  | 30 days  | 1 property |
| Pro    | ₹599  | 60 days  | 1 property |

Rules:
- No unlimited listings
- No lifetime plans
- Expiry hides listing automatically

---

## 4) LISTING EXPIRY / DELETE POLICY (LOCKED)
- On plan expiry: listing becomes hidden (not visible)
- Soft delete: `deleted_at`
- Hard delete buffer (7–15 days): future decision

---

## 5) OTP LOGIN SYSTEM (CURRENTLY IMPLEMENTED)
### 5.1 PURPOSE (LOCKED)
OTP is ONLY for login/session (phone ownership confirmation).  
OTP is NOT verification/approval of owner/property.

### 5.2 FLOW (SUMMARY)
- PIN check (Hisar only)
- Send OTP
- Verify OTP
- Session token stored: `localStorage.arh_token`

### 5.3 OTP RULES (LOCKED)
- 60 sec resend cooldown
- Max 3 OTP in 4 hours per number
- OTP valid for 5 minutes
- Token stored locally

### 5.4 FRONTEND STORAGE KEYS (LOCKED)
localStorage:
- arh_token
- arh_otp_cooldown_until
- arh_otp_lock_until
- arh_otp_sent_once_<mobile>

sessionStorage:
- arh_pincode
- arh_mobile

---

## 6) FRONTEND FILE STRUCTURE (LIVE)
- /index.html               → Home
- /listings/index.html      → Listings (demo → live later)
- /pricing/index.html       → Plans (pricing UI)
- /post/index.html          → Post flow (PIN + OTP)
- /legal/index.html         → Legal + disclaimers

/assets/
- app.js                    → OTP + PIN logic
- styles.css                → All styling
- arh-logo.png

---

## 7) BACKEND (Cloudflare Worker) — CURRENT + ROUTES
Endpoints:
- GET  /check-pincode?pincode=XXXXXX
- POST /send-otp
- POST /verify-otp
- GET  /me (Bearer token)

Auth:
- Authorization: Bearer <arh_token>

---

## 8) PRICING PAGE (CURRENT WORK AREA) — IMPORTANT
File: /pricing/index.html

Required DOM:
- <section class="grid-3" id="pricingGrid">
  - <article class="card" data-plan="basic|premium|pro">
  - button: <button class="btn btn-primary select-btn" type="button">Select Plan</button>

Intended behavior:
- Card OR button click:
  - add `.selected` to that card
  - selected card button text → “Selected”
  - other cards button text → “Select Plan”
- Default on load: Premium selected

Known issue (as of last session):
- JS executes
- DOM elements found
- `.selected` class applied
- Visual highlight NOT visible
- Root cause likely: CSS override / selector / cache
- Conclusion: CSS problem, not JS

CSS requirement:
- Keep selected highlight CSS at END of styles.css (final winning override).

---

## 9) LEGAL PAGE — FINAL TEXT (READY)
Use on: /legal/index.html (content section)

Legal Disclaimer – ARH Rentals
ARH Rentals is an online rental advertisement and information-access platform.

The platform allows property owners to publish rental advertisements and allows users to browse such listings.
ARH Rentals does not verify, validate, inspect, or authenticate any property, owner, tenant, document, or claim made in any listing.

Important Clarifications
- ARH Rentals is NOT a real estate broker or agent
- ARH Rentals does NOT act as a mediator between owners and tenants
- ARH Rentals does NOT guarantee:
  - tenant availability
  - lead generation
  - response from listed properties
  - deal success or closure
- All listings are owner-posted advertisements
- Users must independently verify:
  - property details
  - ownership
  - rent terms
  - documents
  - suitability before any transaction

Limitation of Liability
ARH Rentals shall not be responsible or liable for:
- any loss, dispute, fraud, or damage
- any transaction entered into between users
- accuracy or completeness of listing information

Use of this platform signifies acceptance of these terms.

---

## 10) NEXT PHASE (NOT IMPLEMENTED YET) — REFERENCE ONLY
### 10.1 DATABASE TABLES (ALREADY CREATED)
- payments, credits, listings, users, sessions, otps

### 10.2 LOCKED LOGIC
- Payment success → create 1 credit
- Listing publish → consume 1 credit
- Listing expiry → hide → soft delete → later purge

### 10.3 OWNER FLOW SKELETON (FUTURE)
1) /post (PIN check)
2) Choose Plan (redirect /pricing)
3) Payment (Razorpay)
4) After success → show property form
5) Submit → POST /listings/create with credit_id

### 10.4 EXPIRY JOB (FUTURE)
- POST /jobs/expire-listings (admin/cron)
- expire: status="published" AND expires_at < now → status="expired"

---

## 11) SEEKER UNLOCK (FUTURE PLANS) — REFERENCE ONLY
This section is NOT ACTIVE and NOT IMPLEMENTED.

Principles (LOCKED):
- No city-wide unlock
- No pincode-wide unlock
- Unlock is micro-area only (sector/colony/market)
- Limited property-count unlock only (no unlimited)
- Residential and Commercial always separate

Indicative future ideas:
Residential:
- ₹29 → 1 micro area → 1 property → 24 hrs
- ₹59 → 1 micro area → 5 properties → 5 days
- ₹99 → 1 micro area → 10 properties → 7 days

Commercial:
- ₹49 → 1 micro area → 1 property → 24 hrs
- ₹99 → 1 micro area → 5 properties → 5 days
- ₹149 → 1 micro area → 10 properties → 7 days

---

## 12) GLOBAL UI/UX RULES (LOCKED)
- Responsive ALWAYS: Mobile + Tablet + Desktop
- Clean, readable, no clutter
- No fake trust claims
- Informational + legal-safe tone

---

## 13) “NEW CHAT” WORKFLOW RULES (LOCKED)
- Preserve existing working functionality
- Do not change OTP / pricing logic unless explicitly asked
- If anything unclear → ASK FIRST (no assumptions)
- Do not auto-implement future features without confirmation
- If conflict: THIS MASTER FILE is final authority

---
END
