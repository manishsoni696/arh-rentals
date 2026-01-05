🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v5.9)
Last Updated: Jan 2026 (Jan 5, 2026)

OVERALL GOAL (NON-NEGOTIABLE)

✅ Website visually premium ho
✅ Fast load ho (no bloat)
✅ SEO-friendly ho
✅ Mobile + Tablet + Desktop perfect ho
✅ No technical compromise — jo zarurat ho, wo change hoga

OVERALL STATUS

🔒 Core Stable
✅ Auth + Pricing + Legal + Post Flow Locked
🟡 Listings UI FINALIZATION IN PROGRESS (ACTIVE)
🟠 styles.css CLEANUP REQUIRED (HIGH PRIORITY)
⏳ SEO & Backend Planning Deferred

✅ COMPLETED & LOCKED (DO NOT TOUCH)
1) Working Rules & Execution Process — 🔒 LOCKED

Rules Master finalized (Manish working style)
✅ Single-chat workflow confirmed (no multi-expert / no master-controller)
✅ One task at a time, sequential fixes only
✅ One step = one file = one paste box
✅ Mobile + Tablet + Desktop mandatory

Important note (updated):
Owner requested: “Full code nahi chahiye, sirf exact change + exact location”
→ Still follows paste-box rule (code only inside paste box), but only the minimal snippet is shared.

2) Core UI Foundation — 🔒 LOCKED

Dark SaaS-style theme finalized
Header structure locked (Brand | Nav | CTA)
Hero hierarchy refined
Button system standardized
Card system finalized

3) Mobile Menu (NAV) — 🔒 LOGIC LOCKED

Status: Stable & acceptable
Working on (verified):
Home ✅ | Pricing ✅ | Listings ✅ | Legal ✅ | Post Property ✅

NAV STRATEGY (LOCKED LOGIC):

JS toggles only:

body.nav-open

.menu.is-open or #primary-navigation.is-open

No heavy JS

No framework

IMPORTANT:
❌ Random nav/menu rewrite NOT allowed
❌ Breaking existing nav logic NOT allowed
✅ Minimal targeted CSS/JS allowed

NOTES (WHAT HAPPENED):
Mobile hamburger visibility issues came because some pages had hamburger inside .header-actions and CSS was hiding .header-actions on mobile.

Final fix approach was:

Keep .header-actions visible on mobile

Hide only .header-cta

Force .nav-toggle visible

4) Authentication Philosophy — 🔒 LOCKED

OTP = session confirmation only
PIN login allowed
No “verification / approval” language
Limits & cooldowns finalized

5) Pricing Page — Card Selection — 🔒 LOCKED

Card + button click both work
Only one card selectable
Premium selected by default
Visual highlight stable
Final CSS override locked at END of styles.css
All breakpoints verified
🚫 Revisit only if business model changes

6) Session & OTP Backend Validation — ✅ DONE

60s resend cooldown
Max 3 OTP / 4 hours
OTP validity: 5 minutes
PIN restriction enforced
/me protected with Bearer token
Same-device session supported

7) OTP Security Hardening — ✅ DONE

OTP single-use enforced
Wrong OTP attempt limit
Replay protection
/me endpoint verified
Session expiry strategy deferred (future)

8) Plans / Pricing Page UX — 🔒 LOCKED

Clear rule: 1 Plan = 1 Property
No broker / no deal guarantee copy placed
“Next Step” guidance added

Pricing clarity section finalized:

Which plan is right for you?

Important before you select

Conversion-safe & legal-safe

9) Legal Page — 🔒 LOCKED

Footer links corrected (absolute paths)
Disclaimer aligned with zero-responsibility model
No banned words
Responsive verified

10) Post Property Page — 🔒 LOCKED

File: /post/index.html
Flow locked: PIN → OTP → Property → Plan
No misleading language
Frontend validation safe
Footer + disclaimer aligned
Responsive verified

11) Home Page — 🔒 LOCKED

UI finalized
Hero & CTA hierarchy stable
Responsive verified

🟡 LISTINGS PAGE — CURRENT ACTIVE WORK AREA
12) Listings Filters UI — IN PROGRESS (NOT FROZEN)
✅ WHAT IS DONE

Filters redesigned to be realistic (initial version):

City

Area / Sector

Property Type

Rent Range dropdown (structure approved)

Sorting intentionally removed

“Search Properties” CTA added (UI-only)

“Unlock Details” future note present (inside each listing card)

Helper text bug fixed:

“Filters are UI-ready…” text was wrongly placed → removed from HTML

Small cleanup started:

Inline spacing reduced

Dedicated class approach planned for notes

✅ NEW (DECIDED IN THIS SESSION): FINAL FILTER ARCHITECTURE — HYBRID MODEL (LOCKED)
🎯 Layout Decision (LOCKED)

✅ Hybrid filters:

Primary Filters = TOP BAR (always visible)

Secondary Filters = Sidebar / “More Filters” panel

Reason:

Filters zyada hain → top-only clutter ho jayega

Sidebar-only mobile UX weak ho sakta hai

Hybrid gives best conversion + speed + clean UI

✅ PRIMARY FILTERS (TOP BAR — ALWAYS VISIBLE) — LOCKED
🏠 Residential (Category: Residential)

Primary:

City (default Hisar)

Property Category: Residential

Property Type (House / Flat / PG)

Area / Sector (text)

Size (Sq Yds)

Rent Range

🏢 Commercial (Category: Commercial)

Primary:

City

Property Category: Commercial

Property Type (Shop / Office / Warehouse)

Area / Sector

Size (Sq Ft)

Rent Range

✅ Notes:

Size unit difference locked: Residential = Sq Yds, Commercial = Sq Ft

This matches real-estate market expectation in India.

✅ SECONDARY FILTERS (SIDEBAR / MORE FILTERS) — LOCKED
🏠 Residential Secondary

Amenities

BHK

Furnishing: Unfurnished / Semi-Furnished / Furnished

Property Age

Floor (NEW LOCKED):

Ground

First

Second

Third+

🚫 Basement NOT allowed in residential (locked)

🏢 Commercial Secondary

Amenities

Furnishing: Unfurnished / Furnished

Floor (NEW LOCKED):

Basement

Ground

First

Second

Upper / Other

❌ WHAT IS STILL PENDING (UPDATED)
Listings UI structure still not professional enough

Needs real-estate style layout (reference-style):

Desktop: filters sidebar left + results right

Mobile: primary top + secondary collapsible/drawer

Hybrid UI implementation pending

Build Primary Filter row (top)

Move Secondary filters into sidebar / More Filters panel

Conditional logic UI:

Residential vs Commercial (show correct size unit + floors + bhk visibility)

Dropdown readability must remain permanently fixed

Options visibility, contrast, background, focus states

🚨 styles.css HEALTH STATUS (VERY IMPORTANT)
13) styles.css — OVERLOADED / NEEDS CLEANUP (NOT OPTIONAL)

Current reality:

Same feature solved multiple times with duplicate blocks

Listings filters styled 5–8 times with conflicts

Mobile menu fixed multiple times with force overrides

:has() used heavily → future risk + inconsistent support in some environments

“ADD-ONLY” blocks now override each other (not clean)

✅ WHAT WE WILL KEEP (LOCK)

Core theme + base UI (buttons, cards, header, footer)

Mobile Nav final working logic (ONLY one final set)

Pricing FINAL WINNING OVERRIDE (must remain at end)

Listings FINAL FILTERS UI block (only one)

🧹 CLEANUP STRATEGY (LOCKED)
Delete duplicate older blocks that target same selectors repeatedly:

Listings filters earlier versions

Multiple nav fixes that do same thing

Repeated header “Step 2.x” blocks (keep final)

After cleanup:

styles.css becomes stable and predictable

future work becomes fast and safe

⚠️ Rule: Cleanup will be done as a separate controlled task (one file, one paste box).

🎯 LISTINGS UI TARGET (REFERENCE-STYLE)

Desktop:

Sidebar filters on LEFT

Listings on RIGHT

Compact spacing

Professional real-estate look

Filters UI:

Primary top bar (clean)

Secondary sidebar with checkbox/pills

Price as dropdown ranges (default) OR slider only if lightweight

Mobile:

Primary top stacked

Secondary collapses into drawer/accordion

No clutter

Smooth scroll

⚠️ Listings UI MUST NOT be frozen until hybrid layout is complete.

⏳ UPDATED PRIORITY QUEUE
🟠 PRIORITY 1A — FINISH LISTINGS FILTER UI (ACTIVE)

Steps:

Convert to Hybrid filters (Primary top + Secondary sidebar/more panel)

Implement Residential vs Commercial view logic (UI-level)

Add Floor filter (locked options)

Ensure correct size unit (Sq Yds vs Sq Ft)

Fix dropdown readability permanently

Balance CTA size & alignment

Verify Desktop + Tablet + Mobile

✅ After this → FREEZE LISTINGS UI

🟠 PRIORITY 1B — styles.css CLEANUP (IMMEDIATELY AFTER LISTINGS FINAL)

Steps:

Keep only ONE listings filters system

Keep only ONE nav mobile system

Keep pricing final override at very end

Remove duplicate “step blocks” that override each other

Validate all pages quickly (Home, Pricing, Listings, Legal, Post)

✅ After cleanup → LOCK styles.css

🟡 PRIORITY 2 — SEO & DISCOVERABILITY (DEFERRED)

Start only after Listings freeze + styles cleanup:

Google Search Console review

On-page SEO audit

⚪ PRIORITY 3 — FUTURE (DO NOT START YET)

Listings API integration
Contact unlock logic
Customer Dashboard
AI Listing Assistant
Subscription automation
Analytics & event tracking

▶️ NEXT IMMEDIATE ACTION (CONFIRMED)

👉 Finish Listings Filters UI (Hybrid: HTML + CSS + minimal JS allowed)
👉 Freeze Listings UI
👉 Then styles.css cleanup (remove duplicates + lock final structure)
👉 Then move to SEO or backend planning

🧠 FINAL EXECUTION RULES (LOCKED)

✅ HTML changes ALLOWED
✅ CSS changes ALLOWED
✅ JS changes ALLOWED (minimal, performance-safe)

ONE task at a time
ONE file per step
ONE paste-box per step

If deleting:
→ Mention clearly BEFORE delete

Website quality > artificial restrictions

END — MASTER v5.9 (NEW CHAT REFERENCE READY)
