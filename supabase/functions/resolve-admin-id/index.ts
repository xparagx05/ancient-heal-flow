// Resolves an Admin ID → email; only succeeds if the user actually has the admin role.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { admin_id } = await req.json();
    if (!admin_id || typeof admin_id !== "string") {
      return json({ error: "admin_id required" }, 400);
    }
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await client.rpc("resolve_admin_email", {
      _admin_id: admin_id.trim().toUpperCase(),
    });
    if (error) return json({ error: error.message }, 500);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return json({ error: "No admin account found with that ID." }, 404);
    return json({ email: row.email });
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
