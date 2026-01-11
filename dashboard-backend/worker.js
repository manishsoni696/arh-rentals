// ARH Rentals Dashboard Backend Worker
// Handles: Dashboard listings, Photo uploads (R2), Cloud drafts (D1)

// Dynamic CORS based on origin
function getCorsHeaders(request) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = [
        "https://rent.anjanirealheights.com",
        "https://manishsoni696.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ];

    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    };
}

const DRAFT_EXPIRY_DAYS = 3;
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const VALID_TYPES = ["image/jpeg", "image/png"];

function jsonResponse(body, status = 200, request = null) {
    const corsHeaders = request ? getCorsHeaders(request) : {
        "Access-Control-Allow-Origin": "https://rent.anjanirealheights.com",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    };

    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}

function getToken(request) {
    const header = request.headers.get("Authorization") || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) return "";
    return token.trim();
}

// SHA256 helper for token hashing
async function sha256(input) {
    const enc = new TextEncoder();
    const buf = enc.encode(String(input));
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function resolveMobileFromToken(request, env) {
    const token = getToken(request);
    if (!token || !env.DB) return "";

    const tokenHash = await sha256(token);
    const now = Date.now();

    const session = await env.DB.prepare(`
    SELECT phone FROM sessions
    WHERE token_hash = ?
      AND expires_at > ?
    LIMIT 1
  `).bind(tokenHash, now).first();

    if (!session) return "";
    return session.phone || "";
}

// Generate UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Clean expired drafts
async function cleanExpiredDrafts(env) {
    if (!env.DB) return;
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare("DELETE FROM drafts WHERE expires_at < ?").bind(now).run();
}

// =========================================================================
// EXISTING: My Listings
// =========================================================================
async function handleMyListings(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    const query = `
    SELECT id, title, area, plan, expires_at, status, created_at, deleted_at
    FROM listings
    WHERE owner_mobile = ?1 AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;

    const result = await env.DB.prepare(query).bind(mobile).all();
    return jsonResponse(result.results || [], 200, request);
}

// =========================================================================
// NEW: Upload Init (R2 Pre-signed URLs)
// =========================================================================
async function handleUploadInit(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.PHOTOS) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    try {
        const body = await request.json();
        const { listingId, category, fileCount, fileTypes, fileSizes } = body;

        // Validate
        if (!listingId || !Array.isArray(fileTypes) || !Array.isArray(fileSizes)) {
            return jsonResponse({ success: false, message: "Invalid request" }, 400, request);
        }

        if (fileCount > MAX_PHOTOS || fileTypes.length > MAX_PHOTOS || fileSizes.length > MAX_PHOTOS) {
            return jsonResponse({ success: false, message: `Maximum ${MAX_PHOTOS} photos allowed` }, 400, request);
        }

        // Validate each file
        for (let i = 0; i < fileTypes.length; i++) {
            if (!VALID_TYPES.includes(fileTypes[i])) {
                return jsonResponse({ success: false, message: "Only JPG/PNG allowed" }, 400, request);
            }
            if (fileSizes[i] > MAX_FILE_SIZE) {
                return jsonResponse({ success: false, message: "File too large (max 1 MB)" }, 400, request);
            }
        }

        // Generate upload keys and create upload tokens
        const uploads = [];
        for (let i = 0; i < fileCount; i++) {
            const uuid = generateUUID();
            const ext = fileTypes[i] === "image/png" ? "png" : "jpg";
            const key = `photos/${listingId}/${category || 'general'}/${uuid}.${ext}`;

            // For R2, we'll create a token that allows upload to this specific key
            // Frontend will upload via our worker endpoint
            const uploadToken = await sha256(`${key}-${Date.now()}-${mobile}`);

            uploads.push({
                key,
                uploadToken,
                uploadUrl: `${request.url.replace('/api/uploads/init', '')}/api/uploads/put?key=${encodeURIComponent(key)}&token=${uploadToken}`
            });
        }

        return jsonResponse({ success: true, uploads }, 200, request);
    } catch (error) {
        console.error("Upload init error:", error);
        return jsonResponse({ success: false, message: "Upload init failed" }, 500, request);
    }
}

// =========================================================================
// NEW: R2 Upload Handler (PUT endpoint)
// =========================================================================
async function handleR2Upload(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
        });
    }

    if (!env.PHOTOS) {
        return new Response(JSON.stringify({ success: false, message: "Storage not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
        });
    }

    try {
        const url = new URL(request.url);
        const key = url.searchParams.get("key");

        if (!key || !key.startsWith("photos/")) {
            return new Response(JSON.stringify({ success: false, message: "Invalid key" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
            });
        }

        // Get the file data from request body
        const fileData = await request.arrayBuffer();

        // Upload to R2
        await env.PHOTOS.put(key, fileData, {
            httpMetadata: {
                contentType: request.headers.get("Content-Type") || "image/jpeg",
            },
        });

        return new Response(JSON.stringify({ success: true, key }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
        });
    } catch (error) {
        console.error("R2 upload error:", error);
        return new Response(JSON.stringify({ success: false, message: "Upload failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
        });
    }
}

// =========================================================================
// NEW: Create Listing
// =========================================================================
async function handleCreateListing(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    try {
        const data = await request.json();

        // Validate required fields
        const required = ['category', 'property_type', 'area', 'rent', 'floor_on_rent'];
        for (const field of required) {
            if (!data[field]) {
                return jsonResponse({ success: false, message: `Missing ${field}` }, 400, request);
            }
        }

        // Validate photos
        const masterPhotos = Array.isArray(data.master_interior_photos) ? data.master_interior_photos : [];
        if (masterPhotos.length !== 2) {
            return jsonResponse({ success: false, message: "Exactly 2 master photos required" }, 400, request);
        }

        const now = Math.floor(Date.now() / 1000);
        const listingId = generateUUID();
        const expiresAt = now + (30 * 24 * 60 * 60); // 30 days

        // Combine all photos
        const additionalInterior = Array.isArray(data.additional_interior_photos) ? data.additional_interior_photos : [];
        const exteriorPhotos = Array.isArray(data.exterior_photos) ? data.exterior_photos : [];
        const allPhotos = [...masterPhotos, ...additionalInterior, ...exteriorPhotos];

        // Insert listing
        const query = `
      INSERT INTO listings (
        id, mobile, category, property_type, city, area, rent, security_deposit,
        floor_on_rent, size, size_unit, furnishing, property_age,
        available_from, amenities, extra_notes, master_interior_photos, 
        additional_interior_photos, exterior_photos, status, created_at, expires_at
      ) VALUES (
        ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, 'active', ?20, ?21
      )
    `;

        await env.DB.prepare(query).bind(
            listingId,
            mobile,
            data.category,
            data.property_type,
            data.city || "Hisar",
            data.area,
            parseInt(data.rent),
            data.security_deposit ? parseInt(data.security_deposit) : null,
            data.floor_on_rent,
            data.size ? parseInt(data.size) : null,
            data.size_unit || null,
            data.furnishing || null,
            data.property_age || null,
            data.available_from || null,
            data.amenities ? JSON.stringify(data.amenities) : null,
            data.extra_notes || null,
            JSON.stringify(masterPhotos),
            JSON.stringify(additionalInterior),
            JSON.stringify(exteriorPhotos),
            now,
            expiresAt
        ).run();

        return jsonResponse({ success: true, listingId }, 200, request);
    } catch (error) {
        console.error("Create listing error:", error);
        return jsonResponse({ success: false, message: "Listing creation failed" }, 500, request);
    }
}

// =========================================================================
// NEW: Save Draft (Cloud)
// =========================================================================
async function handleSaveDraft(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    try {
        const { draft_json } = await request.json();
        if (!draft_json) {
            return jsonResponse({ success: false, message: "No draft data" }, 400, request);
        }

        // Clean expired drafts first
        await cleanExpiredDrafts(env);

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60);

        // Upsert draft (one per mobile)
        const query = `
      INSERT INTO drafts (id, mobile, draft_json, updated_at, expires_at)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(mobile) DO UPDATE SET
        draft_json = excluded.draft_json,
        updated_at = excluded.updated_at,
        expires_at = excluded.expires_at
    `;

        await env.DB.prepare(query).bind(
            generateUUID(),
            mobile,
            draft_json,
            now,
            expiresAt
        ).run();

        return jsonResponse({ success: true, message: "Draft saved" }, 200, request);
    } catch (error) {
        console.error("Save draft error:", error);
        return jsonResponse({ success: false, message: "Draft save failed" }, 500, request);
    }
}

// =========================================================================
// NEW: Get Latest Draft
// =========================================================================
async function handleGetDraft(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    try {
        // Clean expired drafts first
        await cleanExpiredDrafts(env);

        const now = Math.floor(Date.now() / 1000);
        const query = `
      SELECT draft_json, expires_at
      FROM drafts
      WHERE mobile = ?1 AND expires_at > ?2
    `;

        const result = await env.DB.prepare(query).bind(mobile, now).first();

        if (!result) {
            return jsonResponse({ success: true, draft: null }, 200, request);
        }

        return jsonResponse({ success: true, draft: result.draft_json }, 200, request);
    } catch (error) {
        console.error("Get draft error:", error);
        return jsonResponse({ success: false, message: "Draft fetch failed" }, 500, request);
    }
}

// =========================================================================
// NEW: Delete Draft
// =========================================================================
async function handleDeleteDraft(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    try {
        await env.DB.prepare("DELETE FROM drafts WHERE mobile = ?").bind(mobile).run();
        return jsonResponse({ success: true, message: "Draft deleted" }, 200, request);
    } catch (error) {
        console.error("Delete draft error:", error);
        return jsonResponse({ success: false, message: "Draft delete failed" }, 500, request);
    }
}

// =========================================================================
// PROFILE: Get Profile (/me)
// =========================================================================
async function handleGetProfile(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.PROFILES_DB) {
        return jsonResponse({ success: false, message: "Profile database not configured" }, 500, request);
    }

    try {
        const profile = await env.PROFILES_DB.prepare(`
            SELECT phone, name FROM profiles WHERE phone = ? LIMIT 1
        `).bind(mobile).first();

        if (!profile) {
            // Return phone with empty name if no profile exists yet
            return jsonResponse({ phone: mobile, name: "" }, 200, request);
        }

        return jsonResponse({ phone: profile.phone, name: profile.name || "" }, 200, request);
    } catch (error) {
        console.error("Get profile error:", error);
        return jsonResponse({ success: false, message: "Failed to fetch profile" }, 500, request);
    }
}

// =========================================================================
// PROFILE: Update Profile Name
// =========================================================================
async function handleUpdateProfile(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.PROFILES_DB) {
        return jsonResponse({ success: false, message: "Profile database not configured" }, 500, request);
    }

    try {
        const body = await request.json();
        const { name } = body;

        // Validate name
        if (!name || typeof name !== 'string') {
            return jsonResponse({ success: false, message: "Name is required" }, 400, request);
        }

        const trimmedName = name.trim();

        // Validate name length and format
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return jsonResponse({ success: false, message: "Name must be between 2-50 characters" }, 400, request);
        }

        // Allow letters, spaces, and dots only
        if (!/^[a-zA-Z.\s]+$/.test(trimmedName)) {
            return jsonResponse({ success: false, message: "Name can only contain letters, spaces, and dots" }, 400, request);
        }

        const now = new Date().toISOString();

        // Upsert profile
        await env.PROFILES_DB.prepare(`
            INSERT INTO profiles (phone, name, createdAt, updatedAt)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(phone) DO UPDATE SET
                name = excluded.name,
                updatedAt = excluded.updatedAt
        `).bind(mobile, trimmedName, now, now).run();

        return jsonResponse({ ok: true, name: trimmedName }, 200, request);
    } catch (error) {
        console.error("Update profile error:", error);
        return jsonResponse({ success: false, message: "Failed to update profile" }, 500, request);
    }
}

// =========================================================================
// MAIN HANDLER
// =========================================================================
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: getCorsHeaders(request) });
        }

        // EXISTING ROUTE
        if (url.pathname === "/my-listings" && request.method === "GET") {
            return handleMyListings(request, env);
        }

        // NEW ROUTES
        if (url.pathname === "/api/uploads/init" && request.method === "POST") {
            return handleUploadInit(request, env);
        }

        // R2 Upload endpoint - supports both /put and /r2 for compatibility
        if ((url.pathname === "/api/uploads/put" || url.pathname === "/api/uploads/r2") && request.method === "PUT") {
            return handleR2Upload(request, env);
        }

        if (url.pathname === "/api/listings/create" && request.method === "POST") {
            return handleCreateListing(request, env);
        }

        if (url.pathname === "/api/drafts/save" && request.method === "POST") {
            return handleSaveDraft(request, env);
        }

        if (url.pathname === "/api/drafts/latest" && request.method === "GET") {
            return handleGetDraft(request, env);
        }

        if (url.pathname === "/api/drafts/delete" && request.method === "POST") {
            return handleDeleteDraft(request, env);
        }

        // PROFILE ROUTES
        if (url.pathname === "/api/profile/me" && request.method === "GET") {
            return handleGetProfile(request, env);
        }

        if (url.pathname === "/api/profile/me" && request.method === "PUT") {
            return handleUpdateProfile(request, env);
        }

        return jsonResponse({ success: false, message: "Not found" }, 404, request);
    },
};
