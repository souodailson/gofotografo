// api/forms/submit.ts
/**
 * Envia submissões de formulários públicos/externos com proteção de CAPTCHA (Cloudflare Turnstile).
 * Recebe: { kind: "lead" | "client" | "feedback" | "briefing", formId: string, payload: object, token?: string }
 * - "token" = resposta do Turnstile (obrigatória para formulários públicos)
 *
 * Tabelas mapeadas no MAP (ajuste os nomes conforme seu banco):
 *   - lead      -> "lead_submissions"
 *   - client    -> "client_submissions"        (se não existir ainda, você pode criar depois)
 *   - feedback  -> "feedback_submissions"
 *   - briefing  -> "briefing_submissions"
 *
 * OBS: Essa rota usa SUPABASE_SERVICE_ROLE_KEY e ignora RLS no INSERT (seguro).
 *      A leitura fica protegida por RLS nas tabelas (SQL abaixo).
 */

const MAP: Record<string, string> = {
  lead: "lead_submissions",
  client: "client_submissions",
  feedback: "feedback_submissions",
  briefing: "briefing_submissions",
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { kind, formId, payload, token } = body;

    if (!kind || !formId || !payload) {
      res.status(400).json({ error: "Missing kind, formId or payload" });
      return;
    }

    const table = MAP[kind];
    if (!table) {
      res.status(400).json({ error: `Unknown form kind: ${kind}` });
      return;
    }

    // 1) (Público) Verifica Turnstile se houver token; se você quiser tornar OBRIGATÓRIO, troque a checagem
    if (token) {
      const params = new URLSearchParams();
      params.append("secret", process.env.TURNSTILE_SECRET_KEY || "");
      params.append("response", token);

      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: params,
      });
      const vj = await verify.json();
      if (!vj?.success) {
        res.status(403).json({ error: "Captcha failed" });
        return;
      }
    }

    // 2) Monta o registro + contexto mínimo
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.socket?.remoteAddress as string) ||
      "";
    const record = {
      form_id: String(formId),
      payload,
      submitted_ip: ip || null,
      user_agent: (req.headers["user-agent"] as string) || null,
      created_at: new Date().toISOString(),
    };

    // 3) Insere com Service Role (passa por cima do RLS no INSERT)
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !key) {
      res.status(500).json({ error: "Missing Supabase env vars" });
      return;
    }

    const r = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(record),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(r.status).json({ error: "Supabase insert failed", detail });
      return;
    }

    const json = await r.json();
    res.status(200).json({ ok: true, data: json });
  } catch (e: any) {
    console.error("forms/submit error", e);
    res.status(500).json({ error: "Server error" });
  }
}
