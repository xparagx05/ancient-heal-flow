// Resolves a doctor's Professional ID → email so the client can sign in with email/password.
// Also returns application status so the login page can show the right error.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { professional_id } = await req.json();
    if (!professional_id || typeof professional_id !== "string") {
      return json({ error: "professional_id required" }, 400);
    }
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await client.rpc("resolve_doctor_email", {
      _professional_id: professional_id.trim().toUpperCase(),
    });
    if (error) return json({ error: error.message }, 500);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return json({ error: "No doctor found with that Professional ID." }, 404);
    return json({
      email: row.email,
      application_status: row.application_status,
      is_active: row.is_active,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
