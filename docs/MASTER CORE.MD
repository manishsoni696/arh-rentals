🔐 ARH RENTALS — UPDATED MASTER (TASK 2 SOLVED + TRANSPARENCY PLANNING)

Last Updated: Jan 2026
Status: 🔒 CORE + 🔒 POST-UNLOCK RULES + 🔒 PRE-UNLOCK POPUP LOCKED

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

14) DEAL UNLOCK KE BAAD AVAILABILITY SCENARIOS (🔒 LOCKED)
14.1 SCOPE

Deal unlock ke baad agar:

Property pehle hi rent pe chadh chuki ho, ya

Owner ka rent dene ka decision change ho gaya ho

to ye scenario valid mana jayega.

14.2 CORE RULE (NON-NEGOTIABLE)

Deal unlock sirf contact access deta hai.
Property availability, owner intent ya deal outcome ki koi guarantee nahi hoti.

ARH Rentals:

Availability ka promise nahi karta

Owner ke decision ke liye responsible nahi hota

Timing ya market movement control nahi karta

(Zero Responsibility Model fully applicable)

14.3 TENANT FEEDBACK (POST-UNLOCK)

Tenant ke paas simple options honge:

“Property already rented”

“Owner not interested in renting now”

Purpose:

Transparency

Duplicate unlocks avoid karna

Listing hygiene improve karna

14.4 LISTING BEHAVIOR (SYSTEM)

Agar listing “Not Available” mark hoti hai:

Listing temporarily hidden / paused ho jayegi

Public listing se remove ho jayegi

Further unlocks avoid honge

14.5 OWNER RE-CONFIRMATION

Owner ko simple choice milegi:

Still available – Reactivate listing

Not available – Close listing

❌ No verification
❌ No penalty
❌ No forced action

14.6 REFUND / CREDIT (REFERENCE ONLY)

Unlock = contact access only

Availability guarantee nahi

Optional future goodwill:

Limited-time report ke case me small credit / coupon

Not promised, not guaranteed

14.7 LOCK STATUS

🔒 RULE FINAL & LOCKED
🔒 Implementation flexible, principle frozen

🔒 SUMMARY (LOCKED)

Deal unlock sirf contact access deta hai.
Property availability owner ke control me hoti hai.
Unavailable mark hone par listing temporarily hide kar di jati hai jab tak owner re-confirm na kare.

15) DEAL UNLOCK SE PEHLE MANDATORY NOTICE (POPUP) (🔒 LOCKED)
15.1 PURPOSE (LOCKED)

Deal unlock se pehle tenant ko short, clear aur unavoidable notice dena mandatory hai taaki:

Galat expectations na bane

Availability guarantee na samjhi jaye

Platform ki legal position clear rahe

15.2 POPUP TRIGGER (LOCKED)

Popup har baar dikhega jab user:

👉 Deal Unlock / Contact Unlock par click kare

Popup accept kiye bina unlock continue nahi hoga.

15.3 POPUP CONTENT (FINAL — 🔒 LOCKED COPY)

Title:
🔔 Important Notice (Please Read)

Message (short & readable):

This unlock gives contact access only.

Property availability is not guaranteed.

Property may already be rented or owner may decline.

ARH Rentals is an information-access platform only.

Footer (small text):
Users must independently verify all details.

Buttons:
✅ I Understand & Continue
❌ Cancel

15.4 DESIGN RULES (LOCKED)

✔ Max 4 bullet points
✔ No scrolling
✔ Plain language
✔ Mobile-friendly
✔ Neutral tone

❌ No long text
❌ No hidden conditions
❌ No aggressive warning

15.5 LEGAL & BUSINESS SAFETY (LOCKED)

✔ Explicit user consent before unlock
✔ Zero-responsibility model reinforced
✔ Refund / dispute risk minimized

15.6 RELATION WITH OTHER RULES

This popup supports and strengthens:

Section 1 — Zero Responsibility Model

Section 13 — Broker-Listed Transparency

Section 14 — Post-Unlock Availability Rules

No conflict with any locked section.

15.7 LOCK STATUS

🔒 FINAL & LOCKED
🔒 Copy frozen
🔒 Mandatory in all unlock flows

16) OWNER COMMUNICATION, STATUS UPDATES & EXPIRY REMINDERS (NEW — 🔒 LOCKED)
16.1 PROPERTY LISTING CONFIRMATION MESSAGE (OWNER)

Jab koi owner apni property ARH Rentals par successfully list karta hai:

✔ Owner ko confirmation message (SMS / WhatsApp) milega
✔ Message ka purpose:

Listing acknowledgement

Transparency

Future communication base

Message will include (short & clear):

Confirmation that property is listed on ARH Rentals

Platform name (ARH Rentals / Anjani Real Heights)

Clear statement: “This is an advertisement listing only”

16.2 TERMS & DISCLAIMER COMMUNICATION (SAFE APPROACH)

SMS / WhatsApp me full Terms & Conditions dena practical nahi hai.

Final approach (🔒 LOCKED):

Message me short disclaimer line

Saath me Terms & Legal page ka link

Example intent (not copy):

“By listing, you agree to platform terms. Read full terms here: [link]”

✔ Legally safe
✔ Readable
✔ Industry-standard

16.3 OWNER PROPERTY STATUS CHANGE (PLANNED — 🔒 LOCKED)

Owner future me apni property ka status change kar sakta hai:

Possible statuses:

Available

Rented

Not available

Rules:

Status change owner ke control me rahega

ARH Rentals status verify nahi karega

Status sirf visibility control ke liye hoga

16.4 EXPIRY REMINDER TO OWNER (IMPORTANT — 🔒 LOCKED)

Property plan expiry se pehle reminder bheja jayega.

Reminder intent:

“Your property listing is about to expire”

“If property is still available, you may renew”

“If not renewed, listing will be automatically hidden”

✔ No pressure
✔ No misleading urgency
✔ Clear outcome explained

16.5 AUTO-EXPIRY BEHAVIOR (RECONFIRMATION)

Agar owner:

Renew nahi karta

Ya property already rented hai

To:

Listing automatically portal se hide ho jayegi

Public users ko visible nahi rahegi

(No deletion promise, only visibility control)

16.6 RENEW OPTION (PROPERTY-SPECIFIC — 🔒 LOCKED)

Renewal:

Same property ke liye hoga

Same owner ke context me

New plan = new validity

Rules:

No auto-renew (unless decided later)

Owner ki explicit action required

16.7 COMMUNICATION CHANNELS (FLEXIBLE)

Future me use ho sakta hai:

SMS

WhatsApp

On-site dashboard notification

(Exact channel decision later)

16.8 ZERO RESPONSIBILITY ALIGNMENT

✔ ARH Rentals availability guarantee nahi karta
✔ Owner decisions platform ke control me nahi
✔ Reminders sirf information ke liye

Legal & business position unchanged.

16.9 STATUS

🔒 PRINCIPLES & FLOW LOCKED
🟡 Exact message copy & timing later decide honge
🟡 Implementation future phase

🔒 SUMMARY LINE (MASTER SAFE)

Property list hone par owner ko confirmation message milega.
Terms ke liye link diya jayega.
Expiry se pehle reminder jayega.
Renew na karne par listing automatically hide ho jayegi.
Status control owner ke paas rahega.

🔒 FINAL CONFIRMATION

Section 14 LOCKED

Section 15 LOCKED

Future changes sirf implementation level par ho sakte hain

Principles, wording aur intent change nahi honge

🔒 FINAL LOCK NOTE

This transparency feature:

Does NOT certify owners

Does NOT verify listings

Does NOT change ARH Rentals’ legal position

It exists only to improve user awareness.

FEATURE (FUTURE) — LISTING STATUS + COMMUNITY REPORTING + AUTO-HIDE (REFERENCE ONLY — NOT ACTIVE)

Goal:

If property is rented, listing must be hidden fast to avoid bad user experience.

Make it owner-driven by default, with a backup user-report flow.

Keep everything automatic as much as possible, but business-safe.

A) OWNER RENEW / STATUS REMINDER (AUTOMATION)

When plan renewal reminder is sent, include a mandatory line:
“If your property is already rented, update status on portal so it gets hidden.”

Owner actions:

“Mark as Rented” → Listing hidden from public listings immediately

“Still Available” → Listing stays live + renewal flow continues

B) USER REPORT FLOW (WHEN TENANT FINDS LISTING IS ALREADY RENTED)
User option:

“Report: Already Rented / Not Available” request submit on portal

System behavior:

Create a “Status Change Request” against that listing

Notify owner via SMS/WhatsApp/email (final channel decision later)

Owner must confirm:

“Yes, rented” → listing hidden

“No, still available” → listing remains, request closed

Business-safety rules:

No automatic hide on user report without owner confirmation (avoid misuse)

Rate-limit reports per user/device

Keep audit log: who reported + when + owner response

Dependencies (later):

Listing model needs: status (available/rented/hidden), lastVerifiedAt, reportCount

Simple owner confirmation link flow (token-based)

Admin fallback (manual override) only if needed

SMS / WhatsApp Templates (APPROVAL REQUIRED — PENDING)

Owner reminder + status check (Renewal)

Owner confirmation request (User reported “Already rented”)

Owner confirmation success (Listing hidden)

Owner rejected report (Listing stays live)

User acknowledgement (Report received; waiting owner confirmation)
