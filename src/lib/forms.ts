// src/lib/forms.ts
/**
 * Envia o formulário para a rota do servidor /api/forms/submit.
 * - kind: "lead" | "client" | "feedback" | "briefing"
 * - formId: id do seu formulário (string)
 * - payload: dados do formulário (objeto simples)
 * - turnstileToken: opcional (se o formulário é público, passe o token)
 */
export async function submitForm(kind: string, formId: string, payload: any, turnstileToken?: string) {
  const resp = await fetch("/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, formId, payload, token: turnstileToken || null }),
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(json?.error || "Falha ao enviar formulário");
  }
  return json;
}
