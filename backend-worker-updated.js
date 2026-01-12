// =========================================================================
// PROFILE: Get Profile (/me)
// =========================================================================
async function handleGetProfile(request, env) {
    const mobile = await resolveMobileFromToken(request, env);
    if (!mobile) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401, request);
    }

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Database not configured" }, 500, request);
    }

    try {
        // First check if profiles table exists, if not create it
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS profiles (
                phone TEXT PRIMARY KEY,
                name TEXT,
                createdAt INTEGER,
                updatedAt INTEGER
            )
        `).run();

        const profile = await env.DB.prepare(`
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

    if (!env.DB) {
        return jsonResponse({ success: false, message: "Database not configured" }, 500, request);
    }

    try {
        const body = await request.json();
        const { name } = body;

        // Validate name
        if (!name || typeof name !== 'string') {
            return jsonResponse({ ok: false, message: "Name is required" }, 400, request);
        }

        const trimmedName = name.trim();

        // Validate name length and format
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return jsonResponse({ ok: false, message: "Name must be between 2-50 characters" }, 400, request);
        }

        // Allow letters, spaces, and dots only
        if (!/^[a-zA-Z.\s]+$/.test(trimmedName)) {
            return jsonResponse({ ok: false, message: "Name can only contain letters, spaces, and dots" }, 400, request);
        }

        const now = Math.floor(Date.now() / 1000);

        // First ensure profiles table exists
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS profiles (
                phone TEXT PRIMARY KEY,
                name TEXT,
                createdAt INTEGER,
                updatedAt INTEGER
            )
        `).run();

        // Upsert profile
        await env.DB.prepare(`
            INSERT INTO profiles (phone, name, createdAt, updatedAt)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(phone) DO UPDATE SET
                name = excluded.name,
                updatedAt = excluded.updatedAt
        `).bind(mobile, trimmedName, now, now).run();

        return jsonResponse({ ok: true, name: trimmedName }, 200, request);
    } catch (error) {
        console.error("Update profile error:", error);
        return jsonResponse({ ok: false, message: "Failed to update profile" }, 500, request);
    }
}
