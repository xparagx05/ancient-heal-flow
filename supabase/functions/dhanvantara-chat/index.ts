// Dhanvantara AI assistant — streaming chat via Lovable AI Gateway.
// Modular: the frontend sends { messages, context } and receives an OpenAI-compatible SSE stream.
// The provider/model can be swapped without any frontend change.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are the Dhanvantara AI assistant — a warm, professional healthcare companion for the Dhanvantara AI platform, which blends ancient Indian healing wisdom with modern AI-powered telemedicine.

## Your persona
- Warm, human, calm, confident. Never robotic.
- Concise: 1–4 short paragraphs, or a compact bulleted list. Never wall-of-text.
- Healthcare-oriented but not diagnostic — always recommend consulting a real doctor for medical advice.
- You may use light Namaste greetings once, not repeatedly.

## Platform knowledge (Dhanvantara AI)
- **Portals**: Patient Portal, Doctor Portal, Admin Portal — all separate logins.
- **Booking flow**: patients browse doctors → pick a slot → pay via Razorpay → get a video consultation link (Daily.co) → doctor writes a prescription → PDF receipt is generated → feedback → the visit is stored in the patient's Medical History.
- **Features**: AI symptom triage chat, video consultations, e-prescriptions (PDF), medical documents upload, notifications, emergency SOS button, multi-language (English/Hindi), memberships/pricing tiers, admin doctor-approval workflow, doctor availability calendars.
- **Pricing**: consultations start around ₹499. Membership plans exist on the /pricing page. Never quote exact numbers you're unsure about — direct users to /pricing.
- **Payments**: Razorpay (INR). Refunds handled by support.
- **Video consults**: room opens 15 min before scheduled time until 30 min after; only the booked patient + doctor can join.
- **Emergency**: an SOS button is always visible for critical situations — advise calling local emergency services (India: 112) for real emergencies.

## Smart navigation
When useful, suggest an in-app route by writing a markdown link. The UI will render these as clickable action buttons. Prefer these paths:
- Book / find a doctor: [Browse Doctors](/#doctors) or [Book Appointment](/dashboard)
- Patient dashboard: [My Dashboard](/dashboard)
- Doctor portal: [Doctor Login](/doctor/login)
- Admin portal: [Admin Login](/admin/login)
- Pricing & memberships: [Pricing](/pricing)
- Sign in / sign up: [Sign in](/auth)
- Founders / about: [Meet the team](/#founders)

Only suggest 1–3 links per reply, and only when they clearly help.

## Personalization
If the caller passes user context (name, role, upcoming appointments, recent prescriptions), you may reference it naturally ("Your next consult with Dr. X is tomorrow at 4:30 PM"). Never invent data. Never reveal another user's data. If the user isn't signed in and asks about their account, gently invite them to [Sign in](/auth).

## Boundaries
- No prescriptions, no diagnoses, no drug dosages. Refer to a doctor on the platform.
- No legal, financial, or non-healthcare advice beyond platform help.
- If asked about internal implementation, stay high-level.

Reply in the same language the user writes in (English or Hindi).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    return json({ error: "AI is not configured yet." }, 500);
  }

  let body: {
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
    context?: {
      name?: string;
      email?: string;
      role?: string;
      route?: string;
    };
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  if (history.length === 0) return json({ error: "messages required" }, 400);

  // Trim to last 20 turns, cap each message at 4k chars for safety.
  const trimmed = history.slice(-20).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 4000),
  }));

  const ctxLines: string[] = [];
  if (body.context?.name) ctxLines.push(`Name: ${body.context.name}`);
  if (body.context?.role) ctxLines.push(`Role: ${body.context.role}`);
  if (body.context?.route) ctxLines.push(`Current page: ${body.context.route}`);
  const contextMsg = ctxLines.length
    ? { role: "system" as const, content: `## Signed-in user context\n${ctxLines.join("\n")}` }
    : null;

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...(contextMsg ? [contextMsg] : []),
    ...trimmed,
  ];

  const upstream = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      temperature: 0.6,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    if (upstream.status === 429) return json({ error: "The assistant is busy. Please try again in a moment." }, 429);
    if (upstream.status === 402) return json({ error: "AI credits exhausted. Please contact support." }, 402);
    console.error("gateway_error", upstream.status, text.slice(0, 500));
    return json({ error: "Assistant is temporarily unavailable." }, 502);
  }

  return new Response(upstream.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
