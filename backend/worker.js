// ARH Rentals Backend Worker (MERGED)
// Handles: PIN/OTP, Sessions, Dashboard listings, Photo uploads (R2), Cloud drafts (D1)

// ===== TESTING CONFIG =====
const TESTING_MOBILE = "9306766244";
const MASTER_OTP = "123123";

// ===== PHOTO LIMITS =====
const DRAFT_EXPIRY_DAYS = 3;
const MASTER_PHOTOS_REQUIRED = 2;
const MAX_ADDITIONAL_INTERIOR = 6;
const MAX_EXTERIOR_PHOTOS = 2;
const MAX_TOTAL_PHOTOS = 10;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const VALID_TYPES = ["image/jpeg", "image/png"];

// ===== DYNAMIC CORS =====
function getCorsHeaders(request) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = [
        "https://rent.anjanirealheights.com",
        "https://manishsoni696.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ];

    const corsOrigin = allowedOrigins.includes(origin) ? origin : "*";

    return {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

function jsonResponse(data, status = 200, request = null) {
    const headers = request ? getCorsHeaders(request) : {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });
}

async function safeJson(req) {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

function getToken(request) {
    const auth = request.headers.get("Authorization") || "";
    return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
}

async function sha256(input) {
    const enc = new TextEncoder();
    const buf = enc.encode(String(input));
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function resolveMobileFromToken(request, env) {
    const token = getToken(request);
    if (!token) return null;

    const tokenHash = await sha256(token);
    const now = Date.now();
    const session = await env.DB.prepare(`
        SELECT phone FROM sessions
        WHERE token_hash = ?
          AND expires_at > ?
        LIMIT 1
    `).bind(tokenHash, now).first();

    return session ? session.phone : null;
}

function generateUUID() {
    return crypto.randomUUID();
}

async function cleanExpiredSessions(env) {
    if (!env.DB) return;
    const now = Date.now();
    await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now).run();
}

async function cleanExpiredDrafts(env) {
    if (!env.DB) return;
    const cutoff = Math.floor(Date.now() / 1000) - (DRAFT_EXPIRY_DAYS * 24 * 60 * 60);
    await env.DB.prepare("DELETE FROM drafts WHERE created_at < ?").bind(cutoff).run();
}

// =========================================================================
// MY LISTINGS
// =========================================================================
async function handleMyListings(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Database not configured" }, 500, request);
    }

    try {
        const { results } = await env.DB.prepare(`
            SELECT * FROM listings WHERE mobile = ? ORDER BY created_at DESC
        `).bind(mobile).all();

        return jsonResponse({ success: true, listings: results }, 200, request);
    } catch (error) {
        console.error("My listings error:", error);
        return jsonResponse({ success: false, message: "Failed to fetch listings" }, 500, request);
    }
}

// =========================================================================
// UPLOAD INIT (R2 Pre-signed URLs)
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
        if (!listingId || !category || !Array.isArray(fileTypes) || !Array.isArray(fileSizes)) {
            return jsonResponse({ success: false, message: "Invalid request" }, 400, request);
        }

        if (!['master', 'interior', 'exterior'].includes(category)) {
            return jsonResponse({ success: false, message: "Invalid category" }, 400, request);
        }

        // Set limits based on category
        let maxPhotos;
        if (category === 'master') {
            maxPhotos = 2;
        } else if (category === 'interior') {
            maxPhotos = MAX_ADDITIONAL_INTERIOR;
        } else {
            maxPhotos = MAX_EXTERIOR_PHOTOS;
        }

        if (fileCount > maxPhotos || fileTypes.length > maxPhotos || fileSizes.length > maxPhotos) {
            return jsonResponse({ success: false, message: `Maximum ${maxPhotos} ${category} photos allowed` }, 400, request);
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

        // Generate upload keys with category folder
        const uploads = [];
        for (let i = 0; i < fileCount; i++) {
            const uuid = generateUUID();
            const ext = fileTypes[i] === "image/png" ? "png" : "jpg";
            const key = `photos/${listingId}/${category}/${uuid}.${ext}`;

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
// R2 UPLOAD HANDLER
// =========================================================================
async function handleR2Upload(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.PHOTOS) {
        return jsonResponse({ success: false, message: "Storage not configured" }, 500, request);
    }

    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const token = url.searchParams.get("token");

    if (!key || !token) {
        return jsonResponse({ success: false, message: "Missing key or token" }, 400, request);
    }

    try {
        const blob = await request.blob();
        await env.PHOTOS.put(key, blob);
        return jsonResponse({ success: true, key }, 200, request);
    } catch (error) {
        console.error("R2 upload error:", error);
        return jsonResponse({ success: false, message: "Upload failed" }, 500, request);
    }
}

// =========================================================================
// CREATE LISTING
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
        const required = ['category', 'property_type', 'area', 'rent', 'floor_on_rent', 'number_of_rooms', 'size', 'size_unit', 'master_interior_photos'];
        for (const field of required) {
            if (!data[field]) {
                return jsonResponse({ success: false, message: `Missing ${field}` }, 400, request);
            }
        }

        // Validate master interior photos (required: exactly 2, always public)
        const masterPhotos = Array.isArray(data.master_interior_photos) ? data.master_interior_photos : [];
        if (masterPhotos.length !== 2) {
            return jsonResponse({ success: false, message: `Exactly 2 master photos required (always public)` }, 400, request);
        }

        // Validate additional interior photos (optional: 0-6, locked)
        const additionalPhotos = Array.isArray(data.additional_interior_photos) ? data.additional_interior_photos : [];
        if (additionalPhotos.length > MAX_ADDITIONAL_INTERIOR) {
            return jsonResponse({ success: false, message: `Maximum ${MAX_ADDITIONAL_INTERIOR} additional interior photos allowed` }, 400, request);
        }

        // Validate exterior photos (optional: 0-2, locked)
        const exteriorPhotos = Array.isArray(data.exterior_photos) ? data.exterior_photos : [];
        if (exteriorPhotos.length > MAX_EXTERIOR_PHOTOS) {
            return jsonResponse({ success: false, message: `Maximum ${MAX_EXTERIOR_PHOTOS} exterior photos allowed` }, 400, request);
        }

        // Validate total photo count (max 10)
        const totalPhotos = masterPhotos.length + additionalPhotos.length + exteriorPhotos.length;
        if (totalPhotos > MAX_TOTAL_PHOTOS) {
            return jsonResponse({ success: false, message: `Total photos cannot exceed ${MAX_TOTAL_PHOTOS}. You have ${totalPhotos} photos.` }, 400, request);
        }

        const now = Math.floor(Date.now() / 1000);
        const listingId = generateUUID();
        const expiresAt = now + (30 * 24 * 60 * 60); // 30 days

        // Insert listing with separate photo arrays
        const query = `
            INSERT INTO listings (
                id, mobile, category, property_type, city, area, rent, security_deposit,
                floor_on_rent, number_of_rooms, size, size_unit, furnishing, property_age,
                available_from, amenities, extra_notes, master_interior_photos, additional_interior_photos, 
                exterior_photos, status, created_at, expires_at
            ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, 'active', ?21, ?22
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
            data.number_of_rooms,
            parseInt(data.size),
            data.size_unit,
            data.furnishing || null,
            data.property_age || null,
            data.available_from || null,
            data.amenities ? JSON.stringify(data.amenities) : null,
            data.extra_notes || null,
            JSON.stringify(masterPhotos),
            JSON.stringify(additionalPhotos),
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
// SAVE DRAFT
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
        const body = await request.json();
        const { draft_json } = body;

        if (!draft_json || typeof draft_json !== 'string') {
            return jsonResponse({ success: false, message: "Invalid draft data" }, 400, request);
        }

        await cleanExpiredDrafts(env);

        const now = Math.floor(Date.now() / 1000);

        await env.DB.prepare(`
            INSERT INTO drafts (mobile, draft_json, created_at)
            VALUES (?, ?, ?)
            ON CONFLICT(mobile) DO UPDATE SET
                draft_json = excluded.draft_json,
                created_at = excluded.created_at
        `).bind(mobile, draft_json, now).run();

        return jsonResponse({ success: true, message: "Draft saved" }, 200, request);
    } catch (error) {
        console.error("Save draft error:", error);
        return jsonResponse({ success: false, message: "Failed to save draft" }, 500, request);
    }
}

// =========================================================================
// GET DRAFT
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
        await cleanExpiredDrafts(env);

        const cutoff = Math.floor(Date.now() / 1000) - (DRAFT_EXPIRY_DAYS * 24 * 60 * 60);
        const draft = await env.DB.prepare(`
            SELECT draft_json, created_at FROM drafts
            WHERE mobile = ? AND created_at >= ?
            LIMIT 1
        `).bind(mobile, cutoff).first();

        if (!draft) {
            return jsonResponse({ success: true, draft: null }, 200, request);
        }

        return jsonResponse({
            success: true,
            draft: draft.draft_json,
            created_at: draft.created_at
        }, 200, request);
    } catch (error) {
        console.error("Get draft error:", error);
        return jsonResponse({ success: false, message: "Failed to get draft" }, 500, request);
    }
}

// =========================================================================
// DELETE DRAFT
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
        await env.DB.prepare(`DELETE FROM drafts WHERE mobile = ?`).bind(mobile).run();
        return jsonResponse({ success: true, message: "Draft deleted" }, 200, request);
    } catch (error) {
        console.error("Delete draft error:", error);
        return jsonResponse({ success: false, message: "Failed to delete draft" }, 500, request);
    }
}

// =========================================================================
// MAIN HANDLER
// =========================================================================
export default {
    async fetch(request, env) {
        // OPTIONS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: getCorsHeaders(request) });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // ===== Health =====
        if (path === "/" || path === "/health") {
            return jsonResponse({ service: "ARH Rentals Backend", status: "OK" }, 200, request);
        }

        // ===== Allowed PINs =====
        const allowedPincodes = ["125001", "125004", "125005", "125033"];

        // ===== PIN CHECK =====
        if (path === "/check-pincode" && request.method === "GET") {
            const pincode = (url.searchParams.get("pincode") || "").trim();
            if (!pincode) return jsonResponse({ success: false, message: "Pincode required" }, 400, request);

            return jsonResponse({ success: true, allowed: allowedPincodes.includes(pincode) }, 200, request);
        }

        // ===== SEND OTP =====
        if (path === "/send-otp" && request.method === "POST") {
            const body = await safeJson(request);
            if (!body) return jsonResponse({ success: false, message: "Invalid JSON body" }, 400, request);

            const mobile = String(body.mobile || "").trim();
            const pincode = String(body.pincode || "").trim();

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return jsonResponse({ success: false, message: "Invalid mobile number" }, 400, request);
            }
            if (!allowedPincodes.includes(pincode)) {
                return jsonResponse({ success: false, message: "Service not available for this PIN code" }, 403, request);
            }

            // TESTING BYPASS
            if (mobile === TESTING_MOBILE) {
                return jsonResponse({ success: true, message: "OTP sent successfully (testing mode)" }, 200, request);
            }

            const now = Date.now();

            const recent60 = await env.DB.prepare(`
                SELECT 1 FROM otps WHERE mobile = ? AND created_at > ? LIMIT 1
            `).bind(mobile, now - 60 * 1000).first();

            if (recent60) {
                return jsonResponse({ success: false, message: "Please wait 60 seconds before resending OTP." }, 429, request);
            }

            const c4h = await env.DB.prepare(`
                SELECT COUNT(*) as cnt FROM otps WHERE mobile = ? AND created_at > ?
            `).bind(mobile, now - 4 * 60 * 60 * 1000).first();

            if ((c4h?.cnt || 0) >= 3) {
                return jsonResponse({ success: false, message: "OTP limit reached. Try again after 4 hours." }, 429, request);
            }

            const otp = Math.floor(100000 + Math.random() * 900000);

            const message =
                `Your OTP for ARH Rentals login is ${otp}. ` +
                `This OTP is valid for 5 minutes. Do not share it with anyone. - Anjani Real Heights`;

            const smsUrl =
                `${env.SMS_BASE_URL}` +
                `?ApiKey=${encodeURIComponent(env.SMS_API_KEY)}` +
                `&Message=${encodeURIComponent(message)}` +
                `&Contacts=${encodeURIComponent(mobile)}` +
                `&SenderId=${encodeURIComponent(env.SMS_SENDER_ID)}` +
                `&ServiceName=${encodeURIComponent(env.SMS_SERVICE_NAME)}` +
                `&MessageType=${encodeURIComponent(env.SMS_MESSAGE_TYPE)}` +
                `&StartTime=` +
                `&DLTTemplateId=${encodeURIComponent(env.SMS_DLT_TEMPLATE_ID)}`;

            const smsRes = await fetch(smsUrl, { method: "GET" });
            const smsText = await smsRes.text().catch(() => "");

            if (!smsRes.ok) {
                return jsonResponse({ success: false, message: "SMS gateway failed", vendor: smsText }, 502, request);
            }

            const otpHash = await sha256(`${mobile}:${otp}`);
            await env.DB.prepare(`
                INSERT INTO otps (mobile, otp_hash, expires_at, created_at, tries)
                VALUES (?, ?, ?, ?, 0)
            `).bind(mobile, otpHash, now + 5 * 60 * 1000, now).run();

            return jsonResponse({ success: true, message: "OTP sent successfully" }, 200, request);
        }

        // ===== VERIFY OTP =====
        if (path === "/verify-otp" && request.method === "POST") {
            const body = await safeJson(request);
            if (!body) return jsonResponse({ success: false, message: "Invalid JSON body" }, 400, request);

            const mobile = String(body.mobile || "").trim();
            const otp = String(body.otp || "").trim().replace(/\D/g, "");

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return jsonResponse({ success: false, message: "Invalid mobile number" }, 400, request);
            }
            if (!/^\d{4,6}$/.test(otp)) {
                return jsonResponse({ success: false, message: "OTP required" }, 400, request);
            }

            // TESTING BYPASS
            if (mobile === TESTING_MOBILE && otp === MASTER_OTP) {
                await env.DB.prepare(`INSERT OR IGNORE INTO users (phone) VALUES (?)`).bind(mobile).run();
                await cleanExpiredSessions(env);

                const token = crypto.randomUUID();
                const tokenHash = await sha256(token);
                const now = Date.now();
                const expiresAt = now + 2 * 60 * 60 * 1000;

                await env.DB.prepare(`
                    INSERT INTO sessions (token_hash, phone, created_at, expires_at)
                    VALUES (?, ?, ?, ?)
                `).bind(tokenHash, mobile, now, expiresAt).run();

                return jsonResponse({ success: true, token, message: "Login successful (testing mode)" }, 200, request);
            }

            const now = Date.now();
            const MAX_TRIES = 5;

            const active = await env.DB.prepare(`
                SELECT otp_hash, expires_at, tries, created_at FROM otps
                WHERE mobile = ? AND expires_at > ?
                ORDER BY created_at DESC LIMIT 1
            `).bind(mobile, now).first();

            if (!active) {
                return jsonResponse({ success: false, message: "Invalid or expired OTP" }, 400, request);
            }

            if ((active.tries || 0) >= MAX_TRIES) {
                return jsonResponse({ success: false, message: "Too many wrong attempts. Please request a new OTP." }, 429, request);
            }

            const otpHash = await sha256(`${mobile}:${otp}`);

            const match = await env.DB.prepare(`
                SELECT 1 FROM otps WHERE mobile = ? AND otp_hash = ? AND expires_at > ? AND tries < ? LIMIT 1
            `).bind(mobile, otpHash, now, MAX_TRIES).first();

            if (!match) {
                await env.DB.prepare(`
                    UPDATE otps SET tries = COALESCE(tries, 0) + 1
                    WHERE mobile = ? AND expires_at > ? AND otp_hash = ?
                `).bind(mobile, now, active.otp_hash).run();

                const after = (active.tries || 0) + 1;
                if (after >= MAX_TRIES) {
                    return jsonResponse({ success: false, message: "Too many wrong attempts. Please request a new OTP." }, 429, request);
                }

                return jsonResponse({ success: false, message: "Invalid or expired OTP" }, 400, request);
            }

            await env.DB.prepare(`DELETE FROM otps WHERE mobile = ? AND expires_at > ?`).bind(mobile, now).run();

            await env.DB.prepare(`INSERT OR IGNORE INTO users (phone) VALUES (?)`).bind(mobile).run();
            await cleanExpiredSessions(env);

            const token = crypto.randomUUID();
            const tokenHash = await sha256(token);
            const expiresAt = now + (2 * 60 * 60 * 1000);

            await env.DB.prepare(`
                INSERT INTO sessions (token_hash, phone, created_at, expires_at)
                VALUES (?, ?, ?, ?)
            `).bind(tokenHash, mobile, now, expiresAt).run();

            return jsonResponse({ success: true, verified: true, token }, 200, request);
        }

        // ===== /me =====
        if (path === "/me" && request.method === "GET") {
            const token = getToken(request);
            if (!token) return jsonResponse({ success: false, message: "Missing token" }, 401, request);

            const tokenHash = await sha256(token);
            const now = Date.now();
            const s = await env.DB.prepare(`
                SELECT phone, created_at, expires_at FROM sessions
                WHERE token_hash = ? AND expires_at > ? LIMIT 1
            `).bind(tokenHash, now).first();

            if (!s) return jsonResponse({ success: false, message: "Invalid session" }, 401, request);

            return jsonResponse({ success: true, phone: s.phone, created_at: s.created_at }, 200, request);
        }

        // ===== NEW ENDPOINTS =====
        if (path === "/api/listings/my" && request.method === "GET") {
            return handleMyListings(request, env);
        }

        if (path === "/api/uploads/init" && request.method === "POST") {
            return handleUploadInit(request, env);
        }

        if (path === "/api/uploads/put" && request.method === "PUT") {
            return handleR2Upload(request, env);
        }

        if (path === "/api/listings/create" && request.method === "POST") {
            return handleCreateListing(request, env);
        }

        if (path === "/api/drafts/save" && request.method === "POST") {
            return handleSaveDraft(request, env);
        }

        if (path === "/api/drafts/get" && request.method === "GET") {
            return handleGetDraft(request, env);
        }

        if (path === "/api/drafts/delete" && request.method === "POST") {
            return handleDeleteDraft(request, env);
        }

        return jsonResponse({ success: false, message: "Not Found" }, 404, request);
    },
};
