// ARH Rentals OTP Backend (with CORS fix)
// Handles: PIN check, OTP send/verify, Sessions

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
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

function json(data, status = 200, request = null) {
    const headers = request ? getCorsHeaders(request) : {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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

async function sha256(input) {
    const enc = new TextEncoder();
    const buf = enc.encode(String(input));
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Clean expired sessions
async function cleanExpiredSessions(env) {
    if (!env.DB) return;
    const now = Date.now();
    await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now).run();
}

export default {
    async fetch(request, env) {
        // ✅ OPTIONS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: getCorsHeaders(request) });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // ✅ Allowed PINs
        const allowedPincodes = ["125001", "125004", "125005", "125033"];

        // ===== Health =====
        if (path === "/" || path === "/health") {
            return json({ service: "ARH Rentals Backend", status: "OK" }, 200, request);
        }

        // ===== Pincode Check =====
        // GET /check-pincode?pincode=125001
        if (path === "/check-pincode" && request.method === "GET") {
            const pincode = (url.searchParams.get("pincode") || "").trim();
            if (!pincode) return json({ success: false, message: "Pincode required" }, 400, request);

            return json({ success: true, allowed: allowedPincodes.includes(pincode) }, 200, request);
        }

        // ===== SEND OTP =====
        // POST /send-otp  { mobile, pincode }
        if (path === "/send-otp" && request.method === "POST") {
            const body = await safeJson(request);
            if (!body) return json({ success: false, message: "Invalid JSON body" }, 400, request);

            const mobile = String(body.mobile || "").trim();
            const pincode = String(body.pincode || "").trim();

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return json({ success: false, message: "Invalid mobile number" }, 400, request);
            }
            if (!allowedPincodes.includes(pincode)) {
                return json({ success: false, message: "Service not available for this PIN code" }, 403, request);
            }

            const now = Date.now();

            const recent60 = await env.DB.prepare(`
        SELECT 1 FROM otps
        WHERE mobile = ?
          AND created_at > ?
        LIMIT 1
      `).bind(mobile, now - 60 * 1000).first();

            if (recent60) {
                return json({ success: false, message: "Please wait 60 seconds before resending OTP." }, 429, request);
            }

            // ✅ RULE B: max 3 OTP / 4 hours
            const c4h = await env.DB.prepare(`
        SELECT COUNT(*) as cnt FROM otps
        WHERE mobile = ?
          AND created_at > ?
      `).bind(mobile, now - 4 * 60 * 60 * 1000).first();

            if ((c4h?.cnt || 0) >= 3) {
                return json({ success: false, message: "OTP limit reached. Try again after 4 hours." }, 429, request);
            }

            // ✅ Generate OTP
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
                return json({ success: false, message: "SMS gateway failed", vendor: smsText }, 502, request);
            }

            // ✅ Store OTP hash
            const otpHash = await sha256(`${mobile}:${otp}`);
            await env.DB.prepare(`
        INSERT INTO otps (mobile, otp_hash, expires_at, created_at, tries)
        VALUES (?, ?, ?, ?, 0)
      `).bind(
                mobile,
                otpHash,
                now + 5 * 60 * 1000, // expires after 5 min
                now
            ).run();

            return json({ success: true, message: "OTP sent successfully" }, 200, request);
        }

        // ===== VERIFY OTP =====
        // POST /verify-otp { mobile, otp }
        if (path === "/verify-otp" && request.method === "POST") {
            const body = await safeJson(request);
            if (!body) return json({ success: false, message: "Invalid JSON body" }, 400, request);

            const mobile = String(body.mobile || "").trim();
            const otp = String(body.otp || "").trim().replace(/\D/g, "");

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return json({ success: false, message: "Invalid mobile number" }, 400, request);
            }
            if (!/^\d{4,6}$/.test(otp)) {
                return json({ success: false, message: "OTP required" }, 400, request);
            }

            const now = Date.now();
            const MAX_TRIES = 5;

            // Find latest active OTP for this mobile (for tries + lock)
            const active = await env.DB.prepare(`
        SELECT otp_hash, expires_at, tries, created_at
        FROM otps
        WHERE mobile = ?
          AND expires_at > ?
        ORDER BY created_at DESC
        LIMIT 1
      `).bind(mobile, now).first();

            if (!active) {
                return json({ success: false, message: "Invalid or expired OTP" }, 400, request);
            }

            if ((active.tries || 0) >= MAX_TRIES) {
                return json({ success: false, message: "Too many wrong attempts. Please request a new OTP." }, 429, request);
            }

            const otpHash = await sha256(`${mobile}:${otp}`);

            // Match OTP (single-use)
            const match = await env.DB.prepare(`
        SELECT 1
        FROM otps
        WHERE mobile = ?
          AND otp_hash = ?
          AND expires_at > ?
          AND tries < ?
        LIMIT 1
      `).bind(mobile, otpHash, now, MAX_TRIES).first();

            if (!match) {
                // Wrong OTP → increment tries on latest active OTP
                await env.DB.prepare(`
          UPDATE otps
          SET tries = COALESCE(tries, 0) + 1
          WHERE mobile = ?
            AND expires_at > ?
            AND otp_hash = ?
        `).bind(mobile, now, active.otp_hash).run();

                const after = (active.tries || 0) + 1;
                if (after >= MAX_TRIES) {
                    return json({ success: false, message: "Too many wrong attempts. Please request a new OTP." }, 429, request);
                }

                return json({ success: false, message: "Invalid or expired OTP" }, 400, request);
            }

            // OTP success → delete all active OTPs for this mobile (prevents replay/multiple tokens)
            await env.DB.prepare(`
        DELETE FROM otps
        WHERE mobile = ?
          AND expires_at > ?
      `).bind(mobile, now).run();

            // ✅ Ensure user exists
            await env.DB.prepare(`INSERT OR IGNORE INTO users (phone) VALUES (?)`)
                .bind(mobile)
                .run();

            // Clean expired sessions
            await cleanExpiredSessions(env);

            // ✅ Create session token with expiry (TESTING: 2 min | PRODUCTION: 2 hours)
            const token = crypto.randomUUID();
            const tokenHash = await sha256(token);
            const expiresAt = now + (2 * 60 * 60 * 1000); // 2 hours

            await env.DB.prepare(`
        INSERT INTO sessions (token_hash, phone, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `).bind(tokenHash, mobile, now, expiresAt).run();

            return json({ success: true, verified: true, token }, 200, request);
        }

        // ===== /me =====
        if (path === "/me" && request.method === "GET") {
            const auth = request.headers.get("Authorization") || "";
            const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
            if (!token) return json({ success: false, message: "Missing token" }, 401, request);

            const tokenHash = await sha256(token);
            const now = Date.now();
            const s = await env.DB.prepare(`
        SELECT phone, created_at, expires_at FROM sessions
        WHERE token_hash = ?
          AND expires_at > ?
        LIMIT 1
      `).bind(tokenHash, now).first();

            if (!s) return json({ success: false, message: "Invalid session" }, 401, request);

            return json({ success: true, phone: s.phone, created_at: s.created_at }, 200, request);
        }

        return json({ success: false, message: "Not Found" }, 404, request);
    },
};
