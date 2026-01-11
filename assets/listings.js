/* =========================================================
   ARH Rentals - Public Listings Page
========================================================= */

(function () {
    "use strict";

    const BACKEND = "https://arh-backend.manishsoni696.workers.dev";
    // TODO: Replace with your actual R2 public URL/CDN domain
    // Format: https://pub-xxxxx.r2.dev or custom domain
    const R2_PUBLIC_URL = "https://pub-d896e48e886c4c3d88ec418b5db72f52.r2.dev";
    const listingWrap = document.getElementById("listingWrap");
    const resultsCount = document.getElementById("resultsCount");

    // Inject Professional Styles
    function injectStyles() {
        const styleId = 'listing-pro-styles';
        if (document.getElementById(styleId)) return;

        const css = `
        /* Full Width Layout Override */
        .listings-page .container {
            max-width: 100% !important;
            padding-left: 20px;
            padding-right: 20px;
        }

        /* Professional Listing Card Styles (Compact & Premium) */
        .listing-pro-card {
            background: var(--bg2);
            border: 1px solid var(--line);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 16px; /* Compact margin */
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        @media (min-width: 768px) {
            .listing-pro-card { flex-direction: row; height: 220px; } /* Fixed compact height on desktop */
        }
        .listing-pro-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            border-color: var(--blue);
        }
        
        /* Image Section */
        .listing-img-col {
            width: 100%;
            height: 200px;
            position: relative;
            background: #000;
        }
        @media (min-width: 768px) {
            .listing-img-col { width: 300px; height: 100%; flex-shrink: 0; }
        }
        .listing-img-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
        }
        .listing-img-wrapper::-webkit-scrollbar { display: none; }
        .listing-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            flex-shrink: 0;
            scroll-snap-align: center;
        }
        .img-count {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(2px);
            color: #fff;
            font-size: 0.7rem;
            padding: 2px 8px;
            border-radius: 10px;
            z-index: 2;
        }

        /* Content Section */
        .listing-content-col {
            flex: 1;
            padding: 16px; /* Reduced padding */
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        /* Top Row: Title + Location */
        .listing-header {
            margin-bottom: 12px;
        }
        .listing-card-title {
            font-size: 1.1rem; 
            margin: 0 0 4px 0;
            color: var(--text);
            font-weight: 600;
            line-height: 1.3;
        }
        .listing-location {
             display: flex; align-items: center; gap: 4px; 
             color: var(--muted); font-size: 0.85rem; 
        }

        /* Pricing Row (Compact) */
        .listing-stats-row {
            display: flex;
            align-items: center;
            gap: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--line);
            margin-bottom: 12px;
        }
        .stat-item { display: flex; flex-direction: column; }
        .stat-val {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--blue2); /* Highlight price */
            line-height: 1.1;
        }
        .stat-lbl { font-size: 0.75rem; color: var(--muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .v-sep { width: 1px; height: 24px; background: var(--line); }

        /* Features Grid */
        .listing-features-compact {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 20px;
            margin-bottom: auto; /* Push footer down */
        }
        .feat-c-item { display: flex; align-items: center; gap: 8px; }
        .feat-c-icon {
            color: var(--muted);
            width: 16px; height: 16px;
        }
        .feat-c-text { font-size: 0.85rem; color: #d1d5db; }

        /* Actions Footer */
        .listing-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 12px;
        }
        .btn-owner {
            background: var(--blue);
            color: white;
            border: none;
            font-weight: 600;
            font-size: 0.9rem;
            height: 38px;
            padding: 0 20px;
            border-radius: 8px;
            flex: 1;
            transition: all 0.2s;
        }
        .btn-owner:hover { background: var(--blue2); transform: translateY(-1px); }
        
        .btn-icon-outline {
            width: 38px; height: 38px;
            padding: 0;
            display: inline-flex;
            align-items: center; 
            justify-content: center;
            border-radius: 8px;
            border: 1px solid var(--line);
            background: transparent;
            color: var(--muted);
        }
        .btn-icon-outline:hover {
            border-color: #e11d48;
            color: #e11d48;
            background: rgba(225, 29, 72, 0.1);
        }
        
        .tag-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: var(--muted);
            font-size: 0.7rem;
            border: 1px solid var(--line);
        }
        `;
        const style = document.createElement('style');
        style.id = styleId;
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // Call inject styles
    injectStyles();

    // Build query params from filter form
    function buildQueryParams() {
        const params = new URLSearchParams();

        // Category filter
        const category = document.querySelector('input[name="category"]:checked')?.value;
        if (category && category !== 'all') {
            params.append('category', category);
        }

        // Area filter
        const area = document.querySelector('select[name="area"]')?.value;
        if (area && area !== '') {
            params.append('area', area);
        }

        // Property type filter
        const propertyType = document.querySelector('select[name="propertyType"]')?.value;
        if (propertyType && propertyType !== '') {
            params.append('property_type', propertyType);
        }

        // Rent filter (using sliders if they exist, otherwise direct inputs)
        const rentMin = document.querySelector('input[name="rentMin"]')?.value;
        const rentMax = document.querySelector('input[name="rentMax"]')?.value;
        if (rentMin) params.append('rent_min', rentMin);
        if (rentMax && rentMax !== '999999') params.append('rent_max', rentMax);

        // Furnishing filter
        const furnishing = document.querySelector('select[name="furnishing"]')?.value;
        if (furnishing && furnishing !== '') {
            params.append('furnishing', furnishing);
        }

        // Rooms filter
        const rooms = document.querySelector('select[name="rooms"]')?.value;
        if (rooms && rooms !== '') {
            params.append('rooms', rooms);
        }

        // Floor filter
        const floor = document.querySelector('select[name="floor"]')?.value;
        if (floor && floor !== '') {
            params.append('floor', floor);
        }

        return params.toString();
    }

    // Fetch listings from API
    async function fetchListings() {
        if (!listingWrap) return;

        listingWrap.innerHTML = '<p class="muted" style="padding: 2rem; text-align: center;">Loading listings...</p>';

        try {
            const queryString = buildQueryParams();
            const url = `${BACKEND}/api/listings/search?${queryString}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch listings');

            const data = await res.json();

            if (data.success && Array.isArray(data.listings)) {
                renderListings(data.listings);
                updateResultsCount(data.count || data.listings.length);
            } else {
                showError('Unable to load listings');
            }
        } catch (error) {
            console.error(error);
            showError('Network error. Please try again.');
        }
    }

    // Render listings to DOM
    function renderListings(listings) {
        if (!listingWrap) return;

        if (listings.length === 0) {
            listingWrap.innerHTML = `
      <div class="empty-state" style="padding: 3rem; text-align: center;">
        <p class="muted" style="font-size: 1.1rem; margin-bottom: 1rem;">📭 No listings found</p>
        <p class="small muted">Try adjusting your filters or check back later.</p>
      </div>
    `;
            return;
        }

        listingWrap.innerHTML = listings.map(listing => buildListingCard(listing)).join('');
    }

    // Build HTML for a single listing card (Professional Design)
    function buildListingCard(listing) {
        const title = listing.number_of_rooms ?
            `${listing.number_of_rooms} ${listing.property_type}` :
            listing.property_type || 'Property';

        const rent = listing.rent ? `₹${listing.rent.toLocaleString('en-IN')}` : '—';
        const deposit = listing.deposit ? `₹${listing.deposit.toLocaleString('en-IN')}` : '—'; // Assuming deposit field exists, else fallback

        const sizeVal = listing.size || '—';
        const sizeUnit = listing.size_unit || '';

        const furnishing = listing.furnishing || '—';
        const bhk = listing.number_of_rooms ? listing.number_of_rooms : '—';
        const tenantPref = listing.preferred_tenants || 'Any';
        const availableFrom = listing.available_from ? new Date(listing.available_from).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Ready to Move';

        // Photos
        let photoHTML = '';
        let photoCount = 0;
        let firstPhoto = null;

        try {
            const masterPhotos = listing.master_interior_photos ? JSON.parse(listing.master_interior_photos) : [];
            if (Array.isArray(masterPhotos) && masterPhotos.length > 0) {
                photoCount = masterPhotos.length;
                firstPhoto = `${R2_PUBLIC_URL}/${masterPhotos[0]}`;

                // Create slideshow images
                const photoSlides = masterPhotos.map((key, idx) => `
                    <img src="${R2_PUBLIC_URL}/${key}" 
                         alt="${title} photo ${idx + 1}" 
                         class="listing-img" 
                         loading="lazy"
                         onerror="this.style.display='none'">
                `).join('');

                photoHTML = `
                    <div class="listing-img-wrapper" tabindex="0">
                        ${photoSlides}
                    </div>
                `;
            } else {
                // Placeholder
                photoHTML = `
                <div class="listing-img-wrapper">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%236b7280'%3ENo Photos%3C/text%3E%3C/svg%3E" class="listing-img" alt="No photos">
                </div>`;
            }
        } catch (e) { console.error(e); }

        // Icons (SVG strings)
        const icons = {
            furnish: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`, // Box fallback
            bed: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`, // Home fallback
            users: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
            key: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>`,
            heart: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`,
            sofa: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`
        };

        return `
        <div class="listing-pro-card" data-listing-id="${listing.id}">
            <!-- Left: Images -->
            <div class="listing-img-col">
                ${photoHTML}
                <div class="img-count">
                    📷 1 / ${photoCount}
                </div>
            </div>

            <!-- Right: Content -->
            <div class="listing-content-col">
                <div>
                    <div class="listing-header">
                        <h3 class="listing-card-title">${title}</h3>
                        <div class="listing-location">
                            <span>📍</span> ${listing.area || 'Hisar'} &bull; ${listing.city || 'Haryana'}
                        </div>
                    </div>

                    <!-- Pricing Stats -->
                    <div class="listing-stats-row">
                        <div class="stat-item">
                            <div class="stat-val">${rent}</div>
                            <div class="stat-lbl">Rent</div>
                        </div>
                        <div class="v-sep"></div>
                        <div class="stat-item">
                            <div class="stat-val">₹0</div> 
                            <div class="stat-lbl">Deposit</div>
                        </div>
                        <div class="v-sep"></div>
                        <div class="stat-item">
                            <div class="stat-val">${sizeVal}</div>
                            <div class="stat-lbl">${sizeUnit}</div>
                        </div>
                    </div>

                    <!-- Compact Features -->
                    <div class="listing-features-compact">
                        <div class="feat-c-item">
                            ${icons.sofa.replace('width="18" height="18"', 'width="16" height="16" class="feat-c-icon"')} 
                            <span class="feat-c-text">${furnishing}</span>
                        </div>
                        <div class="feat-c-item">
                            ${icons.bed.replace('width="18" height="18"', 'width="16" height="16" class="feat-c-icon"')}
                            <span class="feat-c-text">${bhk}</span>
                        </div>
                        <div class="feat-c-item">
                            ${icons.users.replace('width="18" height="18"', 'width="16" height="16" class="feat-c-icon"')}
                            <span class="feat-c-text">Pref: ${tenantPref}</span>
                        </div>
                        <div class="feat-c-item">
                            <span class="tag-pill">Available: ${availableFrom}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="listing-footer">
                    <button class="btn btn-owner">Get Owner Details</button>
                    <button class="btn-icon-outline" title="Add to Shortlist">${icons.heart}</button>
                </div>
            </div>
        </div>
        `;
    }

    // Update results count display
    function updateResultsCount(count) {
        if (resultsCount) {
            resultsCount.textContent = count === 1 ?
                'Showing 1 property' :
                `Showing ${count} properties`;
        }
    }

    // Show error message
    function showError(message) {
        if (!listingWrap) return;
        listingWrap.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <p class="muted">❌ ${message}</p>
    </div>
  `;
    }

    // Initialize on page load
    function init() {
        fetchListings();

        // Bind "Search Properties" button
        const searchBtn = document.getElementById('searchPropertiesBtn') ||
            document.querySelector('button[type="submit"]');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fetchListings();
            });
        }

        // Bind "Clear Filters" button if it exists
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                // Reset form
                document.querySelectorAll('input, select').forEach(el => {
                    if (el.type === 'radio') {
                        el.checked = el.value === 'all';
                    } else if (el.type === 'checkbox') {
                        el.checked = false;
                    } else {
                        el.value = '';
                    }
                });
                fetchListings();
            });
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); // End IIFE
