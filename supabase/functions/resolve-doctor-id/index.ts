// Resolves a doctor's Professional ID → email so the client can sign in with email/password.
// Also returns application status so the login page can show the right error.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const professional_id = body?.professional_id;
    if (typeof professional_id !== "string" || professional_id.length < 3 || professional_id.length > 64 || !/^[A-Za-z0-9-]+$/.test(professional_id)) {
      return json({ error: "Valid professional_id required" }, 400);
    }
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await client.rpc("resolve_doctor_email", {
      _professional_id: professional_id.trim().toUpperCase(),
    });
    if (error) {
      console.error("[resolve-doctor-id]", error);
      return json({ error: "Lookup failed" }, 500);
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return json({ error: "No doctor found with that Professional ID." }, 404);
    return json({
      email: row.email,
      application_status: row.application_status,
      is_active: row.is_active,
    });
  } catch (e) {
    console.error("[resolve-doctor-id]", e);
    return json({ error: "Lookup failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
