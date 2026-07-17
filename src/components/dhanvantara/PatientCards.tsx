// Additive patient-facing cards. Rendered inside /dashboard without touching the existing layout.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, FileText, Download, Video, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function PatientAppointmentsCard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("appointments")
        .select("*, doctors:doctor_id(full_name, specialization, photo_url)")
        .eq("patient_id", user.id)
        .order("scheduled_at", { ascending: true })
        .limit(5);
      setRows(data ?? []);
    };
    load();
    const ch = supabase
      .channel(`pat-appts-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `patient_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);


  if (!user) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-accent" />
        <h3 className="font-display text-xl">My Consultations</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No consultations yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const scheduled = new Date(r.scheduled_at).getTime();
            const joinable =
              scheduled - Date.now() < 15 * 60 * 1000 &&
              scheduled + (r.duration_min ?? 30) * 60 * 1000 + 30 * 60 * 1000 > Date.now();
            const videoReady = r.mode === "video" && ["confirmed", "in_progress", "scheduled"].includes(r.status);
            return (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.doctors?.full_name ?? "Doctor"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.scheduled_at).toLocaleString()} · {r.mode}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/5">
                    {r.status.replace("_", " ")}
                  </span>
                  {videoReady && joinable && (
                    <Link to={`/consult/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gradient-gold text-foreground hover:scale-[1.02] transition">
                      <Video className="w-3 h-3" /> Join
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// Permanent medical history — completed consultations with diagnosis / medicines / follow-up.
export function PatientHistoryCard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("consultation_summaries")
        .select("*")
        .eq("patient_id", user.id)
        .order("consultation_date", { ascending: false })
        .limit(6);
      setRows(data ?? []);
    };
    load();
    const ch = supabase
      .channel(`pat-history-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultation_summaries", filter: `patient_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const download = async (path: string | null) => {
    if (!path) return;
    const { data } = await supabase.storage.from("prescriptions").createSignedUrl(path, 60 * 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (!user) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-accent" />
        <h3 className="font-display text-xl">Medical History</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your completed consultations will be preserved here.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const meds = Array.isArray(r.medicines) ? r.medicines : [];
            return (
              <div key={r.id} className="rounded-2xl border border-white/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-sm font-medium truncate">{r.doctor_name ? `Dr. ${r.doctor_name}` : "Consultation"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(r.consultation_date).toLocaleDateString()}
                    {r.duration_seconds ? ` · ${Math.round(r.duration_seconds / 60)} min` : ""}
                  </div>
                </div>
                {r.diagnosis && <div className="text-xs text-muted-foreground mb-1"><span className="text-foreground/80">Diagnosis:</span> {r.diagnosis}</div>}
                {meds.length > 0 && (
                  <div className="text-xs text-muted-foreground mb-1">
                    <span className="text-foreground/80">Medicines:</span>{" "}
                    {meds.slice(0, 3).map((m: any) => m.medicine).filter(Boolean).join(", ")}
                    {meds.length > 3 && ` +${meds.length - 3} more`}
                  </div>
                )}
                {r.follow_up_date && (
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground/80">Follow-up:</span> {new Date(r.follow_up_date).toLocaleDateString()}
                  </div>
                )}
                {r.pdf_path && (
                  <button onClick={() => download(r.pdf_path)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    <Download className="w-3 h-3" /> Download prescription
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export function PatientPrescriptionsCard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("prescriptions")
        .select("id, issued_at, pdf_path, diagnosis, doctors:doctor_id(full_name)")
        .eq("patient_id", user.id)
        .not("pdf_path", "is", null)
        .order("issued_at", { ascending: false })
        .limit(5);
      setRows(data ?? []);
    })();
  }, [user]);

  const download = async (path: string) => {
    const { data } = await supabase.storage.from("prescriptions").createSignedUrl(path, 60 * 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (!user) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-accent" />
        <h3 className="font-display text-xl">My Prescriptions</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your prescription PDFs will appear here after consultations.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{r.doctors?.full_name ?? "Doctor"}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {r.diagnosis ?? "Consultation"} · {r.issued_at ? new Date(r.issued_at).toLocaleDateString() : ""}
                </div>
              </div>
              <button onClick={() => download(r.pdf_path)}
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                <Download className="w-3 h-3" /> PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
