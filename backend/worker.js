// ARH Rentals Backend Worker
// Handles: Dashboard listings, Photo uploads (R2), Cloud drafts (D1)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://rent.anjanirealheights.com",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

const DRAFT_EXPIRY_DAYS = 3;
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const VALID_TYPES = ["image/jpeg", "image/png"];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function getToken(request) {
  const header = request.headers.get("Authorization") || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return "";
  return token.trim();
}

async function resolveMobileFromToken(request, env) {
  const token = getToken(request);
  if (!token || !env.SESSIONS) return "";
  const sessionValue = await env.SESSIONS.get(token);
  if (!sessionValue) return "";
  try {
    const parsed = JSON.parse(sessionValue);
    return parsed.mobile || "";
  } catch {
    return sessionValue;
  }
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
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
  }

  const query = `
    SELECT id, title, area, plan, expires_at, status, created_at, deleted_at
    FROM listings
    WHERE owner_mobile = ?1 AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;

  const result = await env.DB.prepare(query).bind(mobile).all();
  return jsonResponse(result.results || []);
}

// =========================================================================
// NEW: Upload Init (R2 Pre-signed URLs)
// =========================================================================
async function handleUploadInit(request, env) {
  const mobile = await resolveMobileFromToken(request, env);
  if (!mobile) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.PHOTOS) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
  }

  try {
    const body = await request.json();
    const { listingId, fileCount, fileTypes, fileSizes } = body;

    // Validate
    if (!listingId || !Array.isArray(fileTypes) || !Array.isArray(fileSizes)) {
      return jsonResponse({ success: false, message: "Invalid request" }, 400);
    }

    if (fileCount > MAX_PHOTOS || fileTypes.length > MAX_PHOTOS || fileSizes.length > MAX_PHOTOS) {
      return jsonResponse({ success: false, message: `Maximum ${MAX_PHOTOS} photos allowed` }, 400);
    }

    // Validate each file
    for (let i = 0; i < fileTypes.length; i++) {
      if (!VALID_TYPES.includes(fileTypes[i])) {
        return jsonResponse({ success: false, message: "Only JPG/PNG allowed" }, 400);
      }
      if (fileSizes[i] > MAX_FILE_SIZE) {
        return jsonResponse({ success: false, message: "File too large (max 1 MB)" }, 400);
      }
    }

    // Generate pre-signed URLs
    const uploads = [];
    for (let i = 0; i < fileCount; i++) {
      const uuid = generateUUID();
      const ext = fileTypes[i] === "image/png" ? "png" : "jpg";
      const key = `photos/${listingId}/${uuid}.${ext}`;

      // Create R2 pre-signed PUT URL (1 hour expiry)
      const uploadUrl = await env.PHOTOS.createMultipartUpload(key);

      uploads.push({ key, uploadUrl: uploadUrl.toString() });
    }

    return jsonResponse({ success: true, uploads });
  } catch (error) {
    console.error("Upload init error:", error);
    return jsonResponse({ success: false, message: "Upload init failed" }, 500);
  }
}

// =========================================================================
// NEW: Create Listing
// =========================================================================
async function handleCreateListing(request, env) {
  const mobile = await resolveMobileFromToken(request, env);
  if (!mobile) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
  }

  try {
    const data = await request.json();

    // Validate required fields
    const required = ['category', 'property_type', 'area', 'rent', 'floor_on_rent', 'number_of_rooms', 'size', 'size_unit', 'photos'];
    for (const field of required) {
      if (!data[field]) {
        return jsonResponse({ success: false, message: `Missing ${field}` }, 400);
      }
    }

    // Validate photos array
    const photos = Array.isArray(data.photos) ? data.photos : [];
    if (photos.length === 0 || photos.length > MAX_PHOTOS) {
      return jsonResponse({ success: false, message: "Invalid photo count" }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const listingId = generateUUID();
    const expiresAt = now + (30 * 24 * 60 * 60); // 30 days

    // Insert listing
    const query = `
      INSERT INTO listings (
        id, mobile, category, property_type, city, area, rent, security_deposit,
        floor_on_rent, number_of_rooms, size, size_unit, furnishing, property_age,
        available_from, amenities, extra_notes, photos, status, created_at, expires_at
      ) VALUES (
        ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, 'active', ?19, ?20
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
      JSON.stringify(photos),
      now,
      expiresAt
    ).run();

    return jsonResponse({ success: true, listingId });
  } catch (error) {
    console.error("Create listing error:", error);
    return jsonResponse({ success: false, message: "Listing creation failed" }, 500);
  }
}

// =========================================================================
// NEW: Save Draft (Cloud)
// =========================================================================
async function handleSaveDraft(request, env) {
  const mobile = await resolveMobileFromToken(request, env);
  if (!mobile) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
  }

  try {
    const { draft_json } = await request.json();
    if (!draft_json) {
      return jsonResponse({ success: false, message: "No draft data" }, 400);
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

    return jsonResponse({ success: true, message: "Draft saved" });
  } catch (error) {
    console.error("Save draft error:", error);
    return jsonResponse({ success: false, message: "Draft save failed" }, 500);
  }
}

// =========================================================================
// NEW: Get Latest Draft
// =========================================================================
async function handleGetDraft(request, env) {
  const mobile = await resolveMobileFromToken(request, env);
  if (!mobile) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
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
      return jsonResponse({ success: true, draft: null });
    }

    return jsonResponse({ success: true, draft: result.draft_json });
  } catch (error) {
    console.error("Get draft error:", error);
    return jsonResponse({ success: false, message: "Draft fetch failed" }, 500);
  }
}

// =========================================================================
// NEW: Delete Draft
// =========================================================================
async function handleDeleteDraft(request, env) {
  const mobile = await resolveMobileFromToken(request, env);
  if (!mobile) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
  }

  try {
    await env.DB.prepare("DELETE FROM drafts WHERE mobile = ?").bind(mobile).run();
    return jsonResponse({ success: true, message: "Draft deleted" });
  } catch (error) {
    console.error("Delete draft error:", error);
    return jsonResponse({ success: false, message: "Draft delete failed" }, 500);
  }
}

// =========================================================================
// MAIN HANDLER
// =========================================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // EXISTING ROUTE
    if (url.pathname === "/my-listings" && request.method === "GET") {
      return handleMyListings(request, env);
    }

    // NEW ROUTES
    if (url.pathname === "/api/uploads/init" && request.method === "POST") {
      return handleUploadInit(request, env);
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

    return jsonResponse({ success: false, message: "Not found" }, 404);
  },
};
