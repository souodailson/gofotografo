// api/admin/set-role.ts
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Header pode vir como string | string[] | undefined
    const raw = req.headers?.["x-internal-secret"];
    const secret = Array.isArray(raw) ? raw[0] : raw;
    const expected = process.env.INTERNAL_ADMIN_API_SECRET || "";

    if (!secret || secret !== expected) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { user_id, is_admin } = body;

    if (!user_id || typeof is_admin !== "boolean") {
      res.status(400).json({ error: "Missing user_id or is_admin" });
      return;
    }

    const url = process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!url || !key) {
      res.status(500).json({ error: "Missing Supabase env vars" });
      return;
    }

    const r = await fetch(`${url}/auth/v1/admin/users/${user_id}`, {
      method: "PUT",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ app_metadata: { is_admin } }),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(r.status).json({ error: "Supabase admin API failed", detail });
      return;
    }

    const json = await r.json();
    res.status(200).json({ ok: true, user: json });
  } catch (e: any) {
    console.error("set-role error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
