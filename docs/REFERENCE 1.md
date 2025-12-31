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
 
  - ---

## 11) Payments + Posting (Owner) — Expected Rules (LOCKED)
### Rule A: Payment is per Property (NOT per user)
- 1 successful payment => **1 property listing credit**
- Same phone number:
  - Property #1 post => payment required
  - Property #2 post => **new payment required**
  - Property #3 post => **new payment required**

### Rule B: Plan is property-level
- Every listing will store:
  - plan_type = basic/premium/pro
  - plan_days = 15/30/60
  - starts_at = payment_time (or publish_time — final decide later)
  - expires_at = starts_at + plan_days

### Rule C: Expiry / Delete policy
- expires_at cross होने पर listing:
  - hidden = true (user visible = NO)
  - deleted_at set (soft delete)
  - after N days => hard delete + media cleanup

### Rule D: Posting allowed only when credit exists
- Owner must be logged in (arh_token required)
- System checks:
  - Does this phone have an **unused credit**?
    - YES => allow posting + mark credit USED
    - NO => redirect to pricing + payment

> NOTE: अभी payment/credits वाला code implemented नहीं है — यह “business rules lock” है।

# ARH Rentals — Reference (OTP + Auth + Plans + Payments + Listings)
_Last updated: 31-Dec-2025_

## 0) Project Goal (Business Model)
ARH Rentals एक rental portal है जहाँ 2 types users हैं:

### A) Owner (Property Post)
- Owner अपनी property post करने के लिए **plan + payment** करेगा.
- **1 payment = 1 property listing credit** (per property charges).
- Same phone number से दूसरी property post करनी हो → **नई payment/plan** लगेगा (new credit).

### B) Seeker (Property Unlock)
- Seeker listings search करेगा.
- किसी listing की full details/owner number unlock करने के लिए **plan + payment** करेगा.
- (Seeker side plans अभी future में implement होंगे)

---

## 1) Frontend Files Map (Static Site)
### Core JS
- **/assets/app.js**
  - PIN check UI logic (post page)
  - OTP send/verify UI logic (post page)
  - UI cooldown + lock handling (localStorage)
  - Token store: localStorage `arh_token`

### Pages
- **/** `index.html`
  - Home page (demo listings)
- **/post/index.html**
  - Owner flow: PIN → (Step2 unlocked) → OTP login UI
- **/pricing/index.html**
  - Owner plans UI (Basic/Premium/Pro) (currently UI only)
- **/listings/index.html**
  - Listings + filters UI (demo)
- **/legal/index.html**
  - Legal page

### Styles / Assets
- **/assets/styles.css** (UI styling)
- **/assets/arh-logo.png** (logo)
- **/assets/allowed_pincodes.json** (optional future use, currently Worker has hardcoded list)

---

## 2) Backend (Cloudflare Worker) — What It Does
Backend Worker URL:
- `https://arh-backend.manishsoni696.workers.dev`

Worker responsibilities currently:
✅ PIN allowed check  
✅ OTP send (via Hisar SMS gateway)  
✅ OTP verify  
✅ Session token create + `/me` endpoint

---

## 3) OTP Flow — Frontend vs Backend Responsibility

### Step A: PIN Check (Owner Post Page)
**Frontend**
- File: `/assets/app.js`
- Trigger: `#pinCheckBtn` click (post page)
- Calls:
  - `GET /check-pincode?pincode=XXXXXX`
- If allowed:
  - `sessionStorage.setItem("arh_pincode", pincode)`
  - UI shows Step2 block (`#step2` visible)

**Backend**
- Route: `GET /check-pincode`
- Allowed PINs (hardcoded array in worker):
  - ["125001","125004","125005","125033"]

---

### Step B: Send OTP
**Frontend** (`/assets/app.js`)
- Button: `#sendOtpBtn`
- Validations:
  - mobile must be 10 digits
  - `arh_pincode` must exist (PIN verified)
  - 4-hour UI lock check per mobile (localStorage map)
- Calls:
  - `POST /send-otp` body `{ mobile, pincode }`

#### Frontend Cooldowns / Locks
1) **60 sec cooldown** (after successful send)
- Key: `localStorage["arh_otp_cooldown_until"] = epoch_ms`
- On page load if cooldown active → button disabled + countdown shown.

2) **4-hour UI lock** (when backend returns OTP limit error)
- Key: `localStorage["arh_otp_lock_until"] = { "<mobile>": epoch_ms }`
- If locked → button shows `Try after Xh Xm Xs`

3) **Send vs Resend Button Text (per mobile)**
- Key: `localStorage["arh_otp_sent_once_<mobile>"] = "1"`
- First time: button base text "Send OTP"
- Next time same mobile: base text "Resend OTP"
- Helper:
  - `otpBtnBaseTextForMobile(mobile)`
  - `markOtpSentOnce(mobile)` (called on OTP success)

**Backend** (`/send-otp`)
- Validations:
  - mobile: /^[6-9]\d{9}$/
  - pincode must be allowed
- Rate limits:
  1) **No OTP within last 60 seconds**
     - checks `otps` table created_at > now-60s
     - returns 429 if violated
  2) **Max 3 OTP per 4 hours**
     - count from `otps` where created_at > now-4h
     - returns 429 with message "OTP limit reached. Try again after 4 hours."
- OTP rules:
  - OTP is 6-digit random
  - Validity: 5 minutes
- Storage:
  - `otps` table stores `otp_hash`, `created_at`, `expires_at`, `tries`

---

### Step C: Verify OTP
**Frontend** (`/assets/app.js`)
- Button: `#verifyOtpBtn`
- Uses:
  - mobile from `sessionStorage["arh_mobile"]`
- Calls:
  - `POST /verify-otp` body `{ mobile, otp }`
- On success:
  - stores token: `localStorage["arh_token"]=token`
  - clears UI lock: `clearLock(mobile)`
  - shows success msg

**Backend** (`/verify-otp`)
- Validations:
  - mobile: /^[6-9]\d{9}$/
  - otp: 4-6 digits
- Checks `otps` table:
  - mobile + otp_hash match
  - created_at within last 5 minutes
- Creates:
  - user row in `users` (INSERT OR IGNORE)
  - session token in `sessions` table (token_hash + phone + created_at)
- Returns:
  - `{ success:true, verified:true, token }`

---

### Step D: Session Check
**Backend**
- Route: `GET /me`
- Header:
  - `Authorization: Bearer <token>`
- Validates token_hash exists in `sessions`

**Frontend**
- Currently token stored but `/me` usage अभी implement नहीं (future)

---

## 4) DB Tables (Cloudflare D1)
Confirmed existing tables:
- `otps`
- `users`
- `sessions`
- `listings`
- `payments` ✅ (created)
- `credits` ✅ (created)

### Current meaning (intended)
#### payments
- One payment attempt/order info
- Fields (typical):
  - id, phone, role(owner/seeker), plan_id, amount_inr
  - status: created/paid/failed/refunded
  - provider: razorpay
  - provider_order_id / provider_payment_id / provider_signature
  - created_at / paid_at

#### credits
- 1 paid payment => 1 credit
- credit status:
  - unused / used / expired
- used_for_listing_id: (owner flow) which listing consumed this credit

#### listings
- listing per property
- must store:
  - owner_phone
  - plan_id (Q1 locked: plan per property)
  - status: draft/published/expired/deleted
  - published_at, expires_at, deleted_at
- Expiry rule:
  - Basic: 15 days
  - Premium: 30 days
  - Pro: 60 days
- Q2 locked:
  - Expired/delete => storage saving (soft delete OR hard delete decision later)

---

## 5) Pricing Plans (Owner)
UI file:
- `/pricing/index.html`

Plans:
- Basic ₹199 → listing visible 15 days
- Premium ₹349 → listing visible 30 days
- Pro ₹599 → listing visible 60 days

Rule Q1 (locked):
- 1 property can have 1 plan
- Same owner phone can choose different plan for next property
- plan tied to that particular listing (not global to owner)

---

## 6) Current Status Summary (What is Done vs Pending)
### DONE
✅ PIN check backend + frontend  
✅ OTP send/verify backend + frontend  
✅ Session token stored in frontend  
✅ D1 tables exist: otps/users/sessions/listings/payments/credits  

### PENDING (Future Work)
- Payment integration (Razorpay):
  - Create order
  - Verify payment signature
  - Mark payments as paid
  - Issue credits after payment success
- Owner listing creation:
  - After payment success, allow submit listing form
  - Consume 1 credit per listing publish
  - Save listing into `listings`
- Auto-expiry job:
  - Mark listings expired after expires_at
- Seeker unlock flow:
  - Payment => credits => unlock contact details
- Token-based protected routes:
  - Only logged-in user can create payment / publish listing

---

## 7) Keys / Storage Keys Used (Frontend)
### localStorage
- `arh_token` → session token (login success)
- `arh_otp_cooldown_until` → resend cooldown epoch ms (global)
- `arh_otp_lock_until` → per mobile lock map `{ mobile: epoch_ms }`
- `arh_otp_sent_once_<mobile>` → "1" means show Resend OTP

### sessionStorage
- `arh_pincode` → verified PIN (post page)
- `arh_mobile` → mobile for OTP verify step

---

## 8) Worker Routes (Backend)
- `GET /health` or `/` → status OK
- `GET /check-pincode?pincode=...`
- `POST /send-otp` `{ mobile, pincode }`
- `POST /verify-otp` `{ mobile, otp }`
- `GET /me` (Bearer token)

---

## 9) Notes / Decisions Locked
- Q1 locked: plan per property listing
- Q2 locked: expired/deleted listings should be removed/hidden to save storage (final delete strategy later)
- Owner flow desired:
  - PIN check → Plan choose + payment → listing details form → publish

---

## 10) Next Step Reminder (Tomorrow)
- Decide exact workflow pages:
  - `/pricing` से plan select करके `/post?plan=premium` redirect?
  - payment success के बाद `/post` में form unlock?
- Backend endpoints needed:
  - create payment order
  - verify payment webhook/signature
  - create credit on paid
  - create listing (requires unused credit)
  - list/search listings
  - expire listings job
