import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, FileText, CheckCircle2, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Item = {
  id?: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  order_index: number;
};

const EMPTY_ITEM: Item = { medicine: "", dosage: "", frequency: "", duration: "", instructions: "", order_index: 0 };

export default function DoctorConsultation() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const [appt, setAppt] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctorRow, setDoctorRow] = useState<any>(null);

  const [notes, setNotes] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [items, setItems] = useState<Item[]>([{ ...EMPTY_ITEM }]);
  const [rxId, setRxId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!appointmentId || !user) return;
    (async () => {
      const { data: a } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();
      setAppt(a);
      if (a) {
        const [{ data: p }, { data: d }, { data: n }, { data: rx }] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", a.patient_id).maybeSingle(),
          supabase.from("doctors").select("*").eq("id", a.doctor_id).maybeSingle(),
          supabase.from("consultation_notes").select("*").eq("appointment_id", a.id).maybeSingle(),
          supabase.from("prescriptions").select("*, prescription_items(*)").eq("appointment_id", a.id).maybeSingle(),
        ]);
        setPatient(p);
        setDoctorRow(d);
        if (n) setNotes({ subjective: n.subjective ?? "", objective: n.objective ?? "", assessment: n.assessment ?? "", plan: n.plan ?? "" });
        if (rx) {
          setRxId(rx.id);
          setDiagnosis(rx.diagnosis ?? "");
          setAdvice(rx.advice ?? "");
          setFollowUp(rx.follow_up_date ?? "");
          const its = (rx.prescription_items ?? []).sort((x: any, y: any) => x.order_index - y.order_index);
          setItems(its.length ? its : [{ ...EMPTY_ITEM }]);
          if (rx.pdf_path) {
            const { data } = await supabase.storage.from("prescriptions").createSignedUrl(rx.pdf_path, 300);
            setPdfUrl(data?.signedUrl ?? null);
          }
        }
      }
    })();
  }, [appointmentId, user]);

  const canSave = useMemo(() => appt && user && appt.doctor_user_id === user.id, [appt, user]);

  const saveNotes = async () => {
    if (!appt) return;
    await supabase.from("consultation_notes").upsert({
      appointment_id: appt.id,
      doctor_user_id: appt.doctor_user_id,
      ...notes,
    }, { onConflict: "appointment_id" });
  };

  const savePrescription = async () => {
    if (!appt) return null;
    setBusy(true);
    try {
      let id = rxId;
      if (!id) {
        const { data, error } = await supabase.from("prescriptions").insert({
          appointment_id: appt.id,
          patient_id: appt.patient_id,
          doctor_user_id: appt.doctor_user_id,
          doctor_id: appt.doctor_id,
          diagnosis, advice, follow_up_date: followUp || null,
        }).select("id").single();
        if (error) throw error;
        id = data.id;
        setRxId(id);
      } else {
        await supabase.from("prescriptions").update({ diagnosis, advice, follow_up_date: followUp || null }).eq("id", id);
      }
      await supabase.from("prescription_items").delete().eq("prescription_id", id);
      const clean = items.filter((it) => it.medicine.trim()).map((it, i) => ({
        prescription_id: id, medicine: it.medicine.trim(), dosage: it.dosage, frequency: it.frequency,
        duration: it.duration, instructions: it.instructions, order_index: i,
      }));
      if (clean.length) await supabase.from("prescription_items").insert(clean);
      toast.success("Prescription saved");
      return id;
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const generatePdf = async () => {
    const id = await savePrescription();
    if (!id) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-prescription-pdf", {
        body: { prescription_id: id },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const { signed_url } = data as { signed_url: string };
      setPdfUrl(signed_url);
      toast.success("Prescription PDF ready");
    } catch (e: any) {
      toast.error(e.message ?? "PDF generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const complete = async () => {
    if (!appt) return;
    await saveNotes();
    await savePrescription();
    await supabase.from("appointments").update({ status: "completed", ended_at: new Date().toISOString() }).eq("id", appt.id);
    toast.success("Consultation completed");
  };

  if (!appt) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Link to="/doctor/appointments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to appointments
      </Link>

      <div className="glass rounded-3xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Consultation</div>
          <h1 className="font-display text-2xl mt-1">{patient?.full_name ?? "Patient"}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {new Date(appt.scheduled_at).toLocaleString()} · {appt.mode} · {appt.status.replace("_", " ")}
          </div>
        </div>
        <div className="flex gap-2">
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm hover:bg-white/5">
              <Download className="w-4 h-4" /> Download PDF
            </a>
          )}
          <button
            onClick={complete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-foreground text-sm hover:scale-[1.02] transition"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete consultation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: SOAP notes */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 glass rounded-3xl p-5">
          <h2 className="font-display text-lg mb-4">SOAP Notes</h2>
          {(["subjective", "objective", "assessment", "plan"] as const).map((k) => (
            <div key={k} className="mb-3">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground">{k}</label>
              <textarea
                value={(notes as any)[k]}
                onChange={(e) => setNotes({ ...notes, [k]: e.target.value })}
                onBlur={saveNotes}
                rows={3}
                disabled={!canSave}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm"
              />
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">Autosaved on blur.</p>
        </motion.div>

        {/* Right: Prescription builder */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Prescription Builder</h2>
            <span className="text-[11px] text-muted-foreground">
              {doctorRow?.professional_id ?? ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="md:col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Diagnosis</label>
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 p-3 relative">
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center hover:bg-rose-500/20 text-rose-400"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input placeholder="Medicine *" value={it.medicine}
                    onChange={(e) => updateItem(setItems, items, idx, "medicine", e.target.value)}
                    className="md:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
                  <input placeholder="Dosage (e.g. 500mg)" value={it.dosage}
                    onChange={(e) => updateItem(setItems, items, idx, "dosage", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
                  <input placeholder="Frequency (1-0-1)" value={it.frequency}
                    onChange={(e) => updateItem(setItems, items, idx, "frequency", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <input placeholder="Duration (5 days)" value={it.duration}
                    onChange={(e) => updateItem(setItems, items, idx, "duration", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
                  <input placeholder="Special instructions" value={it.instructions}
                    onChange={(e) => updateItem(setItems, items, idx, "instructions", e.target.value)}
                    className="md:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
                </div>
              </div>
            ))}
            <button
              onClick={() => setItems([...items, { ...EMPTY_ITEM, order_index: items.length }])}
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <Plus className="w-4 h-4" /> Add medicine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Advice</label>
              <textarea value={advice} onChange={(e) => setAdvice(e.target.value)} rows={2}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Follow-up date</label>
              <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={savePrescription} disabled={busy}
              className="px-4 py-2 rounded-full glass text-sm hover:bg-white/5 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save draft"}
            </button>
            <button
              onClick={generatePdf} disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-foreground text-sm hover:scale-[1.02] transition disabled:opacity-60"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {generating ? "Generating…" : "Generate PDF"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function updateItem(setItems: React.Dispatch<React.SetStateAction<Item[]>>, items: Item[], idx: number, key: keyof Item, value: string) {
  const next = items.slice();
  (next[idx] as any)[key] = value;
  setItems(next);
}
