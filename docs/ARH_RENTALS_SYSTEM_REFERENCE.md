# ARH Rentals — Payment + Listings API Skeleton (Backend + Frontend Reference)
## NEXT PHASE SPEC (NO IMPLEMENTATION YET)
_Last updated: 31-Dec-2025_

---

## 0) Goals (LOCKED)
### Owner Side
- 1 payment = 1 property listing credit
- Same phone:
  - 1st property → payment required
  - 2nd property → new payment required
- Plan is property-level (basic/premium/pro)

### Seeker Side (Future)
- Details unlock will also be pay-per-unlock (future)

---

## 1) Plan Config (Single Source)
Plan IDs:
- basic   → ₹199 → 15 days
- premium → ₹349 → 30 days
- pro     → ₹599 → 60 days

Rules:
- plan_days fixed by plan_id
- Listing expiry = starts_at + plan_days

Decision Pending (only one):
- starts_at = payment_time OR publish_time  
(we will lock later)

---

## 2) Auth / Session (Already Exists)
Backend:
- POST /verify-otp → returns token
- GET /me → validates Bearer token

Frontend:
- localStorage["arh_token"] stores token

Required Header for protected endpoints:
- Authorization: Bearer <arh_token>

---

## 3) Database Tables (Current + Intended Use)

### 3.1 payments (already created)
Purpose:
- payment attempts + payment success record

Required fields (minimum skeleton):
- id (uuid, TEXT PK)
- phone (TEXT)
- role (TEXT)  -- "owner" | "seeker"
- plan_id (TEXT) -- "basic" | "premium" | "pro"
- amount_inr (INTEGER)
- status (TEXT) -- "created" | "paid" | "failed" | "refunded"
- provider (TEXT) -- "razorpay"
- provider_order_id (TEXT)
- provider_payment_id (TEXT)
- provider_signature (TEXT)
- created_at (INTEGER ms)
- paid_at (INTEGER ms)

Indexes:
- (phone), (status), (paid_at)

---

### 3.2 credits (already created)
Purpose:
- 1 paid payment => 1 credit
- credit can be used once

Required fields (minimum skeleton):
- id (uuid, TEXT PK)
- phone (TEXT)
- role (TEXT) -- "owner" | "seeker"
- plan_id (TEXT)
- payment_id (TEXT) -- ref payments.id
- status (TEXT) -- "unused" | "used" | "expired"
- created_at (INTEGER ms)
- used_at (INTEGER ms)
- used_for_listing_id (TEXT)

Indexes:
- (phone,status)
- (payment_id)

---

### 3.3 listings (already exists)
Purpose:
- property listing per post

Required fields (minimum skeleton):
- id (uuid, TEXT PK)
- owner_phone (TEXT)
- plan_id (TEXT)
- title (TEXT)
- property_type (TEXT) -- House/Shop/Office
- area (TEXT)
- pincode (TEXT)
- rent_inr (INTEGER)
- size_sqft (INTEGER)
- furnishing (TEXT)
- description (TEXT)

Status fields:
- status (TEXT) -- "draft" | "published" | "expired" | "deleted"
- created_at (INTEGER ms)
- published_at (INTEGER ms)
- expires_at (INTEGER ms)
- deleted_at (INTEGER ms)

Indexes:
- (pincode)
- (owner_phone)
- (status)

---

## 4) Backend API Skeleton (Worker Routes)

### 4.1 Get Plans (optional, can be hardcoded in frontend too)
GET /plans
Response:
{
  "success": true,
  "plans": [
    {"plan_id":"basic","amount_inr":199,"days":15},
    {"plan_id":"premium","amount_inr":349,"days":30},
    {"plan_id":"pro","amount_inr":599,"days":60}
  ]
}

---

### 4.2 Create Payment Order (OWNER)
POST /payments/create
Auth: Bearer required
Body:
{
  "role": "owner",
  "plan_id": "basic|premium|pro"
}

Backend responsibilities:
- validate token -> phone
- validate plan_id
- compute amount from plan_id
- create payment row status="created"
- create provider order (razorpay) -> provider_order_id
- return order info to frontend

Response:
{
  "success": true,
  "payment_id": "<uuid>",
  "provider": "razorpay",
  "amount_inr": 349,
  "currency": "INR",
  "provider_order_id": "<rzp_order_...>",
  "notes": {"phone":"999...","role":"owner","plan_id":"premium"}
}

---

### 4.3 Verify Payment (OWNER)  (two options)
#### Option A: Frontend Verify (less secure)
POST /payments/verify
Auth: Bearer required
Body:
{
  "payment_id": "<uuid>",
  "provider_order_id": "...",
  "provider_payment_id": "...",
  "provider_signature": "..."
}

Backend responsibilities:
- validate signature (razorpay)
- mark payments.status="paid" + paid_at
- create 1 credit row status="unused" linked to payment_id
- return credit_id

Response:
{
  "success": true,
  "status": "paid",
  "credit_id": "<uuid>"
}

#### Option B: Webhook Verify (recommended)
POST /webhook/razorpay
No auth (signature verified by secret)
Backend:
- verify webhook signature
- mark payment paid
- issue credit

Response:
200 OK

Note:
- We can start with A, then move to B later.

---

### 4.4 Get Available Credits (OWNER)
GET /credits/available?role=owner
Auth: Bearer required

Backend responsibilities:
- find credits where phone = token phone AND role="owner" AND status="unused"
- return list

Response:
{
  "success": true,
  "credits": [
    {"credit_id":"...","plan_id":"premium","created_at":...}
  ]
}

---

### 4.5 Create Listing (OWNER)
POST /listings/create
Auth: Bearer required
Body:
{
  "credit_id": "<uuid>",
  "title": "...",
  "property_type": "House|Shop|Office",
  "area": "...",
  "pincode": "125001",
  "rent_inr": 12000,
  "size_sqft": 1200,
  "furnishing": "Unfurnished|Semi-Furnished|Furnished",
  "description": "..."
}

Backend responsibilities:
- validate token -> owner_phone
- validate credit exists, belongs to phone, role="owner", status="unused"
- validate pincode allowed
- compute expires_at (publish_time + plan_days OR payment_time + plan_days)
- create listing status="published" with plan_id
- mark credit status="used", used_for_listing_id = listing_id, used_at=now

Response:
{
  "success": true,
  "listing_id": "<uuid>",
  "status": "published",
  "plan_id": "premium",
  "published_at": 173..., 
  "expires_at": 173...
}

---

### 4.6 List/Search Listings (PUBLIC)
GET /listings?pin=125001&type=House&max_rent=15000&sort=rent-asc&page=1
Response:
{
  "success": true,
  "items": [
    {"listing_id":"...","title":"...","rent_inr":12000,"pincode":"125001","property_type":"House","plan_id":"premium"}
  ]
}

Notes:
- public list will NOT include owner phone (until seeker unlock implemented)

---

### 4.7 Expiry Job (ADMIN / CRON)
POST /jobs/expire-listings
Auth: Admin secret OR scheduled trigger

Backend responsibilities:
- find listings where status="published" AND expires_at < now
- set status="expired"
- optionally set deleted_at for soft delete

Response:
{
  "success": true,
  "expired_count": 12
}

---

## 5) Frontend Flow Skeleton (Owner)

### 5.1 Owner Flow (Final)
1) /post
   - PIN check (already)
2) Choose Plan
   - redirect to /pricing
3) Payment
   - call POST /payments/create
   - open Razorpay checkout
   - call /payments/verify (or wait webhook)
4) After payment success
   - show property form
   - submit to POST /listings/create with credit_id

Rule enforcement:
- If no unused credit → user must pay
- Each listing consumes exactly 1 credit

---

## 6) UI Pages Mapping (where to add what)

### /pricing/index.html
Add:
- On Select Plan click:
  - store selected plan_id in sessionStorage (ex: arh_selected_plan)
  - redirect to /post?plan=premium OR /post (and show plan selected)

### /post/index.html
Add:
- After PIN OK:
  - Show Plan Selection / Plan Summary
  - Payment button "Pay & Continue"
- After payment success:
  - show property details form + Publish button

### /assets/app.js
Add future modules (not now):
- paymentCreate()
- paymentVerify()
- listingCreate()
- creditCheck()

---

## 7) Seeker Unlock (Future Skeleton Only)
(Not implementing now)

Possible:
- GET /listing/<id>/locked-details  (returns masked phone)
- POST /seeker/payments/create (role="seeker")
- POST /seeker/unlock (consume seeker credit -> return phone)

---

## 8) Troubleshooting Notes
- Owner paid but cannot post:
  - check credits table for unused credit
  - verify credit_id is passed to listingCreate
- Payment success but credit not created:
  - verify /payments/verify executed OR webhook working
- Listing not visible:
  - status must be "published"
  - expires_at > now
  - not deleted_at

---

## 9) Locked Decisions Summary
- 1 payment = 1 listing credit (owner)
- plan per property listing (Q1 locked)
- expiry → hide + soft delete + later purge (Q2 locked)
- PIN must be allowed before posting

---
```0
