import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://appontkr.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return reply({ error: "Configuração do servidor incompleta." }, 500);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return reply({ error: "Sessão não informada." }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) return reply({ error: "Sessão inválida." }, 401);

  try {
    const body = await req.json();
    const password = String(body.password || "");
    if (password.length < 8) return reply({ error: "A senha deve ter pelo menos 8 caracteres." }, 400);

    const { data: profile, error: profileError } = await admin.from("profiles")
      .select("id,company_id,role,active,must_change_password")
      .eq("id", user.id).maybeSingle();
    if (profileError || !profile || !profile.active)
      return reply({ error: "Perfil ativo não encontrado." }, 403);
    if (profile.role !== "company_admin")
      return reply({ error: "Esta etapa é exclusiva do administrador da empresa." }, 403);
    if (profile.must_change_password !== true)
      return reply({ error: "Não há troca de senha pendente para esta conta." }, 409);

    // A senha é alterada no servidor autenticado antes de liberar o acesso.
    const { error: passwordError } = await admin.auth.admin.updateUserById(user.id, { password });
    if (passwordError) return reply({ error: "Não foi possível salvar a nova senha: " + passwordError.message }, 400);

    const { error: flagError } = await admin.from("profiles")
      .update({ must_change_password: false }).eq("id", user.id);
    if (flagError) return reply({ error: "A senha foi alterada, mas a liberação do acesso falhou. Tente novamente." }, 500);

    const { error: auditError } = await admin.from("audit_logs").insert({
      company_id: profile.company_id,
      actor_id: user.id,
      action: "company_admin.password_changed",
      entity_table: "profiles",
      entity_id: user.id,
      details: { operation: "first_password_change_completed" },
    });
    if (auditError) return reply({ error: "Senha alterada, mas o registro da auditoria falhou: " + auditError.message }, 500);

    return reply({ success: true });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Falha inesperada ao alterar a senha." }, 500);
  }
});