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
✅ Mobile + Tablet + Desktop mandatory (LOCKED forever)

Important note (updated):
Owner requested: “Full code nahi chahiye, sirf exact change + exact location”
→ Still follows paste-box rule (code only inside paste box), but only minimal snippet is shared.

2) Core UI Foundation — 🔒 LOCKED

Dark SaaS-style theme finalized
Header structure locked (Brand | Nav | CTA)
Hero hierarchy refined
Button system standardized
Card system finalized

3) Mobile Menu (NAV) — 🔒 LOGIC LOCKED (STABLE)

Status: Stable & acceptable (session verified)
Working on (verified):
Home ✅ | Pricing ✅ | Listings ✅ | Legal ✅ | Post Property ✅

NAV STRATEGY (LOCKED LOGIC):
JS toggles only:

body.nav-open

.menu.is-open OR #primary-navigation.is-open
No heavy JS
No framework

IMPORTANT:
❌ Random nav/menu rewrite NOT allowed
❌ Breaking existing nav logic NOT allowed
✅ Minimal targeted CSS/JS allowed

NOTES (WHAT HAPPENED IN THIS SESSION):

Problem observed: Mobile nav different look/behavior across pages; alignment/visibility inconsistent.

Root reason discussed: Some pages had hamburger inside .header-actions and CSS was hiding .header-actions on mobile → hamburger disappears / nav mismatch.

Final fix approach decided (LOCKED):

Keep .header-actions visible on mobile

Hide only .header-cta

Force .nav-toggle visible

📌 SESSION CHANGE-TRACK (NAV):

File involved (logic side): assets/app.js

Approach: “Single source of truth” mobile nav controller strategy (avoid multiple conflicting nav toggles).

Why: Multiple “nav fix” blocks created conflict risk; we locked final logic and restricted future changes to minimal safe adjustments only.

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
✅ WHAT IS DONE (THIS SESSION TRACKED)

A) “More Filters” button issue addressed (functional intent locked)

Problem seen: “More Filter” button kuch kaam nahi kar raha tha

Fix logic present in assets/app.js:

Button #moreFiltersBtn click → .filters-ui class toggle: .show-more

Button text swaps: “+ More Filters” ↔ “− Less Filters”

Why: Secondary filters ko hide/show karke UI ko clean rakhna (hybrid model ke liye base).

B) Filters Auto-Apply (UI-level) implemented/kept

File: assets/app.js

Logic: Filter form change/input par listings display update

Why: Demo stage me faster UX; Apply button dependency remove (UI-only).

⚠️ NOTE (IMPORTANT):

assets/app.js me earlier attempts ke multiple duplicate filter blocks present the.

Final architecture is decided; but cleanup is planned after Listings UI freeze + styles cleanup task.

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

✅ Notes (LOCKED):

Size unit difference locked: Residential = Sq Yds, Commercial = Sq Ft

Matches India real-estate market expectation.

✅ SECONDARY FILTERS (SIDEBAR / MORE FILTERS) — LOCKED

🏠 Residential Secondary

Amenities

BHK

Furnishing: Unfurnished / Semi-Furnished / Furnished

Property Age

Floor (NEW LOCKED): Ground / First / Second / Third+
🚫 Basement NOT allowed in residential (locked)

🏢 Commercial Secondary

Amenities

Furnishing: Unfurnished / Furnished

Floor (NEW LOCKED): Basement / Ground / First / Second / Upper / Other

❌ WHAT IS STILL PENDING (UPDATED)

🟡 Listings UI structure still not professional enough
Target: Real-estate reference-style layout

Desktop: filters sidebar left + results right

Mobile: primary top + secondary collapsible/drawer

🟡 Hybrid UI implementation pending

Build Primary Filter row (top)

Move Secondary filters into sidebar / More Filters panel

Make “More Filters” behave like proper panel/drawer (mobile-first)

🟡 Conditional logic UI pending

Residential vs Commercial (show correct size unit + floors + BHK visibility)

🟡 Dropdown readability permanent fix pending

Options visibility

Contrast/background

Focus states

Must remain permanently fixed

🚨 styles.css HEALTH STATUS (VERY IMPORTANT)
13) styles.css — OVERLOADED / NEEDS CLEANUP (NOT OPTIONAL)

Current reality (as tracked):

Same feature solved multiple times with duplicate blocks

Listings filters styled 5–8 times with conflicts

Mobile menu fixed multiple times with force overrides

“ADD-ONLY” blocks override each other → not clean

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

future work fast and safe

⚠️ Rule: Cleanup will be done as a separate controlled task (one file, one paste box).

🎯 LISTINGS UI TARGET (REFERENCE-STYLE)

Desktop:

Sidebar filters LEFT

Listings RIGHT

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

Validate pages quickly: Home, Pricing, Listings, Legal, Post
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
