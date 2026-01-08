const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://rent.anjanirealheights.com",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

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

async function handleMyListings(request, env) {
  const mobile = await resolveMobileFromToken(request, env);
  if (!mobile) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, message: "Storage not configured" }, 500);
  }

  // Exclude deleted listings by default.
  const query = `
    SELECT id, title, area, plan, expires_at, status, created_at, deleted_at
    FROM listings
    WHERE owner_mobile = ?1 AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;

  const result = await env.DB.prepare(query).bind(mobile).all();
  return jsonResponse(result.results || []);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/my-listings" && request.method === "GET") {
      return handleMyListings(request, env);
    }

    return jsonResponse({ success: false, message: "Not found" }, 404);
  },
};
