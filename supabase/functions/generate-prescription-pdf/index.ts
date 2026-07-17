// Generates a branded prescription PDF and stores it in the private "prescriptions" bucket.
// Called by a doctor after they've saved a prescription. Requires authenticated user (JWT).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
  const userId = userData.user.id;

  try {
    const { prescription_id } = await req.json();
    if (!prescription_id) return json({ error: "prescription_id required" }, 400);

    // Load prescription with items + doctor + patient details
    const { data: rx, error: rxErr } = await admin
      .from("prescriptions")
      .select("*, prescription_items(*), doctors:doctor_id(full_name, professional_id, specialization, qualification), appointments:appointment_id(scheduled_at)")
      .eq("id", prescription_id)
      .maybeSingle();
    if (rxErr || !rx) return json({ error: rxErr?.message ?? "Prescription not found" }, 404);
    if (rx.doctor_user_id !== userId) return json({ error: "Forbidden" }, 403);

    const { data: patientProfile } = await admin
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", rx.patient_id)
      .maybeSingle();

    // Build PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const gold = rgb(0.83, 0.68, 0.21);
    const ink = rgb(0.09, 0.09, 0.11);
    const muted = rgb(0.45, 0.45, 0.5);

    let y = 800;
    const left = 48;
    const right = 547;

    // Letterhead
    page.drawRectangle({ x: 0, y: 810, width: 595, height: 32, color: gold, opacity: 0.12 });
    page.drawText("DHANVANTARA AI", { x: left, y: 818, size: 14, font: bold, color: gold });
    page.drawText("Premium AI-guided healthcare", { x: right - 175, y: 820, size: 9, font, color: muted });

    y = 790;
    const doctor = rx.doctors as any;
    page.drawText(doctor?.full_name ?? "Doctor", { x: left, y, size: 16, font: bold, color: ink });
    y -= 16;
    page.drawText(`${doctor?.qualification ?? ""}  •  ${doctor?.specialization ?? ""}`, { x: left, y, size: 10, font, color: muted });
    y -= 12;
    page.drawText(`Professional ID: ${doctor?.professional_id ?? "-"}`, { x: left, y, size: 10, font, color: muted });

    // Divider
    y -= 14;
    page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.75, color: gold });

    // Patient block
    y -= 22;
    page.drawText("PATIENT", { x: left, y, size: 9, font: bold, color: muted });
    y -= 14;
    page.drawText(patientProfile?.full_name ?? "-", { x: left, y, size: 12, font: bold, color: ink });
    page.drawText(new Date(rx.appointments?.scheduled_at ?? rx.created_at).toLocaleString(), {
      x: right - 160, y, size: 10, font, color: muted,
    });
    y -= 14;
    if (patientProfile?.email) page.drawText(patientProfile.email, { x: left, y, size: 10, font, color: muted });

    // Diagnosis
    y -= 26;
    if (rx.diagnosis) {
      page.drawText("DIAGNOSIS", { x: left, y, size: 9, font: bold, color: muted });
      y -= 14;
      y = drawWrapped(page, rx.diagnosis, left, y, right - left, 11, font, ink);
    }

    // Rx symbol
    y -= 12;
    page.drawText("Rx", { x: left, y, size: 24, font: bold, color: gold });
    y -= 6;
    page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.88) });

    // Items
    const items = (rx.prescription_items ?? []).sort((a: any, b: any) => a.order_index - b.order_index);
    for (const [idx, it] of items.entries()) {
      y -= 20;
      if (y < 120) { break; } // one page for simplicity in Phase 2A
      page.drawText(`${idx + 1}.  ${it.medicine}`, { x: left, y, size: 12, font: bold, color: ink });
      const meta = [it.dosage, it.frequency, it.duration].filter(Boolean).join("  •  ");
      if (meta) { y -= 13; page.drawText(meta, { x: left + 16, y, size: 10, font, color: muted }); }
      if (it.instructions) { y -= 12; y = drawWrapped(page, it.instructions, left + 16, y, right - left - 16, 10, font, muted); }
    }

    // Advice + follow-up
    if (rx.advice) {
      y -= 24;
      page.drawText("ADVICE", { x: left, y, size: 9, font: bold, color: muted });
      y -= 14;
      y = drawWrapped(page, rx.advice, left, y, right - left, 10, font, ink);
    }
    if (rx.follow_up_date) {
      y -= 16;
      page.drawText(`Follow-up: ${new Date(rx.follow_up_date).toLocaleDateString()}`, { x: left, y, size: 10, font: bold, color: ink });
    }

    // Signature
    page.drawLine({ start: { x: right - 180, y: 120 }, end: { x: right, y: 120 }, thickness: 0.5, color: muted });
    page.drawText(doctor?.full_name ?? "", { x: right - 180, y: 106, size: 10, font: bold, color: ink });
    page.drawText("Digitally issued via Dhanvantara AI", { x: right - 180, y: 94, size: 8, font, color: muted });

    // Footer
    page.drawText("This is a digital prescription generated on Dhanvantara AI.", {
      x: left, y: 40, size: 8, font, color: muted,
    });

    const bytes = await pdf.save();
    const path = `${userId}/${prescription_id}.pdf`;
    const { error: upErr } = await admin.storage.from("prescriptions").upload(path, bytes, {
      contentType: "application/pdf", upsert: true,
    });
    if (upErr) return json({ error: upErr.message }, 500);

    await admin.from("prescriptions").update({ pdf_path: path, issued_at: new Date().toISOString() }).eq("id", prescription_id);

    // Short-lived signed URL (5 min). Clients request a fresh URL when the user clicks download.
    const { data: signed } = await admin.storage.from("prescriptions").createSignedUrl(path, 300);
    return json({ path, signed_url: signed?.signedUrl });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function drawWrapped(page: any, text: string, x: number, y: number, maxWidth: number, size: number, font: any, color: any) {
  const words = text.split(/\s+/);
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      page.drawText(line, { x, y, size, font, color });
      y -= size + 3;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) { page.drawText(line, { x, y, size, font, color }); y -= size + 3; }
  return y;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
