// api/lead/create.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { token, formId, payload } =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!token || !formId || !payload) {
      res.status(400).json({ error: 'Missing token, formId or payload' });
      return;
    }

    // 1) Verifica Turnstile no servidor
    const form = new URLSearchParams();
    form.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
    form.append('response', token);
    const vr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form
    });
    const vj = await vr.json();
    if (!vj?.success) {
      res.status(403).json({ error: 'Captcha failed' });
      return;
    }

    // 2) Grava no Supabase com service role
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const table = process.env.FORMS_TARGET_TABLE!;

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || (req.socket?.remoteAddress as any) || '';
    const record = {
      form_id: formId,
      payload,
      submitted_ip: ip,
      user_agent: req.headers['user-agent'] || null,
      created_at: new Date().toISOString()
    };

    const r = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(record)
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(r.status).json({ error: 'Supabase insert failed', detail });
      return;
    }

    const json = await r.json();
    res.status(200).json({ ok: true, data: json });
  } catch (e: any) {
    console.error('lead/create error', e);
    res.status(500).json({ error: 'Server error' });
  }
}
