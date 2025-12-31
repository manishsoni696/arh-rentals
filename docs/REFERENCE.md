# ARH Rentals — OTP + Posting + Payment Reference (Single Source of Truth)

## 0) Project Summary (Business Model)
ARH Rentals एक rental portal है जिसमें 2 types के users हैं:

1) **Owner (Poster)**  
   - Owner अपनी property post करेगा.
   - **हर property post करने के लिए payment लगेगा** (plan choose करके).
   - Same phone number से 2nd property post करनी है तो **दोबारा payment** (नई property के लिए नया plan).

2) **Tenant/Seeker (Viewer)**  
   - Listings search करेगा.
   - Owner का phone/Full details unlock करने के लिए **payment/plan** लगेगा (future scope).

> Decision Lock: Plan **user-level नहीं**, बल्कि **property-level** attach होगा।  
> Example: Property #1 Premium, Property #2 Basic (same phone) possible.

---

## 1) Current Implemented System (OTP Login)
### 1.1 Frontend OTP Implementation
**File:** `/assets/app.js`  
**Pages using it:**
- `/post/index.html` (Owner posting flow में OTP login UI)
- `/index.html`, `/listings/index.html`, `/pricing/index.html` etc (common script included)

**Frontend does:**
- PIN check: `GET /check-pincode?pincode=xxxxxx`
- Send OTP: `POST /send-otp { mobile, pincode }`
- Verify OTP: `POST /verify-otp { mobile, otp }`
- Success token store: `localStorage.setItem("arh_token", token)`

#### Frontend Local/Session Storage Keys
**localStorage:**
- `arh_token`  
  - backend session token (Bearer token)
- `arh_otp_lock_until`  
  - per-mobile 4 hours lock map: `{ "9999999999": 173... }`
- `arh_otp_cooldown_until`  
  - 60 seconds resend cooldown timestamp (ms)
- `arh_otp_sent_once_<mobile>`  
  - per mobile button label memory (Send vs Resend)

**sessionStorage:**
- `arh_pincode`  (PIN verified)
- `arh_mobile`   (mobile used for OTP verify)

#### Frontend OTP Button Logic (Expected)
- First time mobile pe OTP send => button text base: **"Send OTP"**
- Same mobile pe next time => base text: **"Resend OTP"**
- हर successful send के बाद 60 sec cooldown (UI lock) + countdown.

---

### 1.2 Backend OTP Implementation (Cloudflare Worker)
**Worker code:** (Cloudflare worker)
- Endpoints:
  - `GET /health` or `/`
  - `GET /check-pincode?pincode=125001`
  - `POST /send-otp { mobile, pincode }`
  - `POST /verify-otp { mobile, otp }`
  - `GET /me` (Authorization: Bearer <token>)

**Backend does:**
- Allowed pincodes check
- OTP sending via SMS gateway
- OTP store (hash)
- OTP verify
- Create user (if not exists)
- Create session token and return to frontend

#### Backend OTP Rules (LOCKED)
1) **60 sec resend throttle**
   - If same mobile has OTP request within last 60 sec => 429
2) **Max 3 OTP in 4 hours**
   - If >=3 OTP in last 4 hours => 429 ("Try after 4 hours")
3) OTP validity: **5 minutes**
4) OTP stored as hash: sha256(`${mobile}:${otp}`)

#### DB Tables used in Worker (current)
- `otps`  
  - columns used: `mobile, otp_hash, expires_at, created_at, tries`
- `users`
  - column: `phone`
- `sessions`
  - columns: `token_hash, phone, created_at`

---

## 2) Posting Flow (Owner) — Current UI vs Final Flow
**Page:** `/post/index.html`
### Current UI present
- Step 1: PIN input + "Check" button (backend verifies)
- Step 3: OTP login (mobile, send, otp, verify)
- "Choose Plan (Next)" button currently navigates pricing

### Final Locked Flow (Owner Posting)
1) Owner enters **PIN**
2) Backend confirms allowed => proceed
3) Owner selects **Plan** (Basic/Premium/Pro)
4) Owner completes **payment**
5) Payment success => show **Property Details Form**
6) Submit => property creates in DB and listing goes LIVE with expiry rules

> Important: Payment is per property posting.
> Same phone -> second property => second payment (new plan).

---

## 3) Plans (Owner Posting Plans) — LOCKED
**Source UI:** `/pricing/index.html`

Plans:
- Basic ₹199 — 1 property listing — visible 15 days
- Premium ₹349 — 1 property listing — visible 30 days
- Pro ₹599 — 1 property listing — visible 60 days

**LOCKED rules:**
- Plan always tied to a **single property listing**
- Plan validity counts should be attached to the property (start date will be decided later: payment date vs publish date)
- After plan expiry property should be removed/hide (see delete policy below)

---

## 4) Delete / Expiry Policy — LOCKED (Q2)
### “Expire → Soft delete → Auto purge” (recommended)
1) Expiry day पर property **hide** (user visible = NO)
2) DB में `deleted_at` set (soft delete)
3) 7–15 days बाद permanently delete (hard delete + media cleanup)

Reason:
- Support/dispute buffer
- Fraud checks
- Storage optimization

---

## 5) What is NOT Implemented Yet (Work Pending)
### 5.1 Payment integration (Owner plans)
Payment provider + flow is pending.
We need:
- Payment create order endpoint
- Payment verify webhook endpoint
- Payment success -> generate a “posting credit” / “listing entitlement”

### 5.2 Listing storage (real DB)
Right now listings UI is demo only.
We need DB tables:
- `listings` (property data)
- `listing_media` (photos)
- `payments` (transactions)
- `posting_credits` or `entitlements` (1 paid plan => 1 property)

### 5.3 Tenant unlock payments (future)
Unlock owner phone/details for seekers via plan/payment.
Need separate entitlement logic.

---

## 6) File Map (Where is what)
### Frontend (Static)
- `/assets/app.js`  
  - OTP flow + PIN check + session token localStorage
- `/post/index.html`  
  - PIN check UI + OTP login UI + posting form (will be expanded)
- `/pricing/index.html`  
  - Owner plans UI (Basic/Premium/Pro)
- `/listings/index.html`  
  - Listings browsing UI (demo)
- `/assets/styles.css`  
  - UI styling

### Backend (Cloudflare Worker)
- Worker script (arh-backend...workers.dev)
  - PIN allow list
  - OTP rules + SMS
  - Sessions + /me

---

## 7) API Reference (Current)
### 7.1 Check pincode
GET /check-pincode?pincode=125001
Response:
{ success: true, allowed: true/false }

### 7.2 Send OTP
POST /send-otp
Body: { mobile, pincode }
Rules:
- 60 sec throttle
- max 3 OTP / 4 hours

### 7.3 Verify OTP
POST /verify-otp
Body: { mobile, otp }
Response:
{ success: true, verified: true, token }

### 7.4 Me (Session check)
GET /me
Header: Authorization: Bearer <token>

---

## 8) Next Implementation Notes (Owner Payments + Posting)
To enforce: “1 payment => 1 property; second property => new payment”
We must implement:
- payments table records
- entitlement/credit:
  - (phone, plan, status=unused/used, expires, used_listing_id)
- When owner clicks "Post Property":
  - require valid session token
  - require unused entitlement
  - on successful listing create => mark entitlement used

---

## 9) Deployment Notes
- Frontend deployed as static site (Cloudflare Pages)
- Backend deployed as Cloudflare Worker + D1 DB

---

## 10) Quick Troubleshooting
- OTP not sending:
  - check backend 429 rules
  - check SMS gateway response
- OTP button stuck:
  - check localStorage keys:
    - arh_otp_cooldown_until
    - arh_otp_lock_until
- Session issues:
  - check localStorage arh_token
  - call /me to validate token
