// Daily.co room provisioning + join-token issuance.
// Called by BOTH patient and doctor when entering the consultation. The function:
//   1. Verifies the caller is the appointment's patient OR its doctor (JWT-based).
//   2. Enforces the join window (T-15 min → scheduled_at + duration + 30 min).
//   3. Refuses if the appointment is completed or cancelled.
//   4. Creates a private Daily room once and persists room_url / room_name / room_expires_at.
//   5. Issues a short-lived meeting token scoped to that room + user + role.
// Provider is swappable — only this file talks to Daily's HTTP API.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const DAILY_API = "https://api.daily.co/v1";
const JOIN_WINDOW_BEFORE_MIN = 15;
const JOIN_WINDOW_AFTER_MIN = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const dailyKey = Deno.env.get("DAILY_API_KEY");
  if (!dailyKey) {
    return json({ configured: false, error: "Video not yet available. DAILY_API_KEY is missing." }, 503);
  }

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const jwt = auth.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Resolve caller from their JWT.
    const asUser = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: userData } = await asUser.auth.getUser(jwt);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const appointmentId = body.appointmentId as string | undefined;
    if (!appointmentId) return json({ error: "appointmentId required" }, 400);

    // Service-role client for the trusted lookup / update (RLS bypass, we do our own authz).
    const svc = createClient(supabaseUrl, serviceKey);

    const { data: appt, error: apptErr } = await svc
      .from("appointments")
      .select("id, patient_id, doctor_user_id, doctor_id, scheduled_at, duration_min, status, room_url, room_name, room_expires_at, mode")
      .eq("id", appointmentId)
      .maybeSingle();

    if (apptErr || !appt) return json({ error: "Appointment not found" }, 404);

    // ---- Authorization: only the two participants may enter. ----
    const role: "doctor" | "patient" | null =
      appt.doctor_user_id === user.id ? "doctor" :
      appt.patient_id === user.id ? "patient" : null;
    if (!role) return json({ error: "Forbidden" }, 403);

    if (appt.mode !== "video") return json({ error: "This appointment is not a video consultation." }, 400);
    if (appt.status === "cancelled") return json({ error: "This consultation was cancelled." }, 400);
    if (appt.status === "completed") return json({ error: "This consultation has already ended." }, 410);

    // ---- Join window enforcement. ----
    const scheduled = new Date(appt.scheduled_at).getTime();
    const duration = (appt.duration_min ?? 30) * 60_000;
    const openAt = scheduled - JOIN_WINDOW_BEFORE_MIN * 60_000;
    const closeAt = scheduled + duration + JOIN_WINDOW_AFTER_MIN * 60_000;
    const now = Date.now();
    if (now < openAt) {
      return json({
        error: "waiting",
        message: `The consultation opens ${JOIN_WINDOW_BEFORE_MIN} minutes before your appointment.`,
        opensAt: new Date(openAt).toISOString(),
      }, 200);
    }
    if (now > closeAt) return json({ error: "The consultation window has closed." }, 410);

    // ---- Ensure a Daily room exists for this appointment. ----
    let roomUrl = appt.room_url;
    let roomName = appt.room_name;
    const roomExpUnix = Math.floor(closeAt / 1000);

    if (!roomUrl || !roomName) {
      // Use the appointment id (lowercase, no dashes) to keep the name stable and unguessable.
      roomName = `dhanv-${appt.id.replace(/-/g, "").slice(0, 24)}-${crypto.randomUUID().slice(0, 6)}`;
      const roomRes = await fetch(`${DAILY_API}/rooms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${dailyKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          privacy: "private",
          properties: {
            exp: roomExpUnix,
            eject_at_room_exp: true,
            enable_chat: true,
            enable_screenshare: true,
            enable_knocking: false,
            enable_prejoin_ui: false,
            start_video_off: false,
            start_audio_off: false,
          },
        }),
      });
      if (!roomRes.ok) {
        const txt = await roomRes.text();
        return json({ error: `Daily.co error: ${txt}` }, 502);
      }
      const room = await roomRes.json();
      roomUrl = room.url;
      await svc.from("appointments").update({
        room_url: roomUrl,
        room_name: roomName,
        room_expires_at: new Date(closeAt).toISOString(),
      }).eq("id", appt.id);
    }

    // ---- Issue meeting token (scoped to this room + user + role). ----
    const patientProfile = role === "patient"
      ? await svc.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle()
      : { data: null };
    const doctorRow = role === "doctor"
      ? await svc.from("doctors").select("full_name").eq("user_id", user.id).maybeSingle()
      : { data: null };

    const displayName =
      role === "doctor" ? `Dr. ${doctorRow.data?.full_name ?? "Doctor"}` :
      patientProfile.data?.full_name ?? user.email ?? "Patient";

    const tokenRes = await fetch(`${DAILY_API}/meeting-tokens`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dailyKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: displayName,
          user_id: user.id,
          is_owner: role === "doctor",
          exp: roomExpUnix,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });
    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return json({ error: `Daily.co token error: ${txt}` }, 502);
    }
    const { token } = await tokenRes.json();

    // ---- Move appointment into `in_progress` when the doctor enters (first time). ----
    if (role === "doctor" && appt.status === "confirmed") {
      await svc.from("appointments")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", appt.id);
    }

    return json({
      configured: true,
      role,
      room: { url: roomUrl, name: roomName, expiresAt: new Date(closeAt).toISOString() },
      token,
      displayName,
      appointment: {
        id: appt.id,
        scheduledAt: appt.scheduled_at,
        durationMin: appt.duration_min,
        status: appt.status,
      },
    });
  } catch (err) {
    console.error("[create-daily-room]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
