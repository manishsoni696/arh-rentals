/* =========================================================
   ARH Rentals - Public Listings Page
========================================================= */

(function () {
    "use strict";

    const BACKEND = "https://arh-backend.manishsoni696.workers.dev";
    const listingWrap = document.getElementById("listingWrap");
    const resultsCount = document.getElementById("resultsCount");

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

    // Build HTML for a single listing card
    function buildListingCard(listing) {
        const title = listing.number_of_rooms ?
            `${listing.number_of_rooms} ${listing.property_type}` :
            listing.property_type || 'Property';

        const rent = listing.rent ? `₹${listing.rent.toLocaleString('en-IN')}` : '—';
        const size = listing.size && listing.size_unit ?
            `${listing.size} ${listing.size_unit}` :
            '—';
        const furnishing = listing.furnishing || '—';
        const floor = listing.floor_on_rent || '—';
        const age = listing.property_age || '—';

        // Format dates from unix timestamps
        const createdDate = listing.created_at ?
            new Date(listing.created_at * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) :
            '—';
        const expiryDate = listing.expires_at ?
            new Date(listing.expires_at * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) :
            '—';

        return `
    <div class="listing" data-listing-id="${listing.id}" data-rent="${listing.rent || 0}" data-status="active">
      <div>
        <h3>${title}</h3>
        <p>${listing.area || '—'} • Hisar</p>
        <ul class="listing-meta">
          <li><span class="label">Property Type:</span> ${listing.property_type || '—'}</li>
          <li><span class="label">Area:</span> ${listing.area || '—'} (Hisar)</li>
          <li><span class="label">Posted On:</span> ${createdDate}</li>
          <li><span class="label">Valid Till:</span> ${expiryDate}</li>
        </ul>
        <div class="pills">
          <span class="pill">${listing.property_type || 'Property'}</span>
          <span class="pill">${rent}</span>
          <span class="pill">${size}</span>
          <span class="pill">${furnishing}</span>
        </div>
      </div>
      <button class="btn" disabled>Unlock Details</button>
      <div class="small muted listing-contact">
        Contact is shared by the owner. ARH Rentals does not mediate or confirm responses.
      </div>
      <div class="small muted listing-note">
        Contact details unlock will be available in a future update.
      </div>
      <div class="small muted listing-expiry">
        Listings automatically become hidden after expiry if not renewed by the owner.
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
