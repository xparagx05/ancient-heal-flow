import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEED_TOKEN = "dhanvantara-seed-2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  if (url.searchParams.get("token") !== SEED_TOKEN) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: cors });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: Record<string, unknown> = {};

  // ---- Admin ----
  const adminEmail = "demo.admin@dhanvantara.ai";
  const adminPassword = "DemoAdmin@2026";
  let adminId: string | null = null;
  {
    const { data, error } = await supa.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Demo Admin" },
    });
    if (error && !String(error.message).toLowerCase().includes("already")) {
      results.adminError = error.message;
    } else if (data?.user) {
      adminId = data.user.id;
    }
    if (!adminId) {
      const { data: list } = await supa.auth.admin.listUsers();
      adminId = list.users.find((u) => u.email === adminEmail)?.id ?? null;
    }
    if (adminId) {
      await supa.from("user_roles").upsert({ user_id: adminId, role: "admin" }, { onConflict: "user_id,role" });
      await supa.from("admin_profiles").upsert({ user_id: adminId }, { onConflict: "user_id" });
      const { data: prof } = await supa.from("admin_profiles").select("admin_id").eq("user_id", adminId).maybeSingle();
      results.admin = { email: adminEmail, password: adminPassword, admin_id: prof?.admin_id };
    }
  }

  // ---- Doctor ----
  const docEmail = "demo.doctor@dhanvantara.ai";
  const docPassword = "DemoDoctor@2026";
  let docUserId: string | null = null;
  {
    const { data, error } = await supa.auth.admin.createUser({
      email: docEmail,
      password: docPassword,
      email_confirm: true,
      user_metadata: { full_name: "Dr. Aarav Mehta" },
    });
    if (error && !String(error.message).toLowerCase().includes("already")) {
      results.doctorError = error.message;
    } else if (data?.user) {
      docUserId = data.user.id;
    }
    if (!docUserId) {
      const { data: list } = await supa.auth.admin.listUsers();
      docUserId = list.users.find((u) => u.email === docEmail)?.id ?? null;
    }
    if (docUserId) {
      await supa.from("user_roles").upsert({ user_id: docUserId, role: "doctor" }, { onConflict: "user_id,role" });

      // Ensure an approved application exists
      const { data: existingApp } = await supa
        .from("doctor_applications")
        .select("id, status")
        .eq("user_id", docUserId)
        .maybeSingle();
      if (!existingApp) {
        await supa.from("doctor_applications").insert({
          user_id: docUserId,
          full_name: "Dr. Aarav Mehta",
          email: docEmail,
          phone: "+91 90000 00001",
          registration_number: "DEMO-REG-2026",
          specialization: "General Medicine",
          qualification: "MBBS, MD (Internal Medicine)",
          experience_years: 8,
          consultation_fee: 499,
          languages: ["English", "Hindi"],
          working_hours: {},
          bio: "Demo physician account for platform testing.",
          status: "approved",
        });
      } else if (existingApp.status !== "approved") {
        await supa.from("doctor_applications").update({ status: "approved" }).eq("id", existingApp.id);
      }

      // Ensure a doctor row exists
      const { data: existingDoc } = await supa
        .from("doctors")
        .select("id, professional_id, is_active")
        .eq("user_id", docUserId)
        .maybeSingle();
      if (!existingDoc) {
        await supa.from("doctors").insert({
          user_id: docUserId,
          full_name: "Dr. Aarav Mehta",
          specialization: "General Medicine",
          qualification: "MBBS, MD (Internal Medicine)",
          experience_years: 8,
          consultation_fee: 499,
          languages: ["English", "Hindi"],
          bio: "Demo physician account for platform testing.",
          is_active: true,
        });
      } else if (!existingDoc.is_active) {
        await supa.from("doctors").update({ is_active: true }).eq("id", existingDoc.id);
      }
      const { data: doc } = await supa
        .from("doctors")
        .select("professional_id")
        .eq("user_id", docUserId)
        .maybeSingle();
      results.doctor = { email: docEmail, password: docPassword, professional_id: doc?.professional_id };
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
