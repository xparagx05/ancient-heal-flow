// Daily.co room creation. Called when an appointment is confirmed (Phase 2 wiring).
// Degrades gracefully if DAILY_API_KEY is not set.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const key = Deno.env.get("DAILY_API_KEY");
  if (!key) {
    return new Response(
      JSON.stringify({
        configured: false,
        error: "DAILY_API_KEY is not configured. Add it in backend secrets to enable video consultations.",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { appointmentId, expiresInMinutes = 60 } = await req.json();
    if (!appointmentId) {
      return new Response(JSON.stringify({ error: "appointmentId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    const roomName = `dhanv-${appointmentId}-${Math.random().toString(36).slice(2, 8)}`;

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp,
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: `Daily.co error: ${text}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({
        configured: true,
        room: { url: data.url, roomName: data.name, expiresAt: new Date(exp * 1000).toISOString() },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
