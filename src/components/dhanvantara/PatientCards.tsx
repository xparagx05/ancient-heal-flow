// Additive patient-facing cards. Rendered inside /dashboard without touching the existing layout.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, Download, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function PatientAppointmentsCard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("appointments")
        .select("*, doctors:doctor_id(full_name, specialization, photo_url)")
        .eq("patient_id", user.id)
        .order("scheduled_at", { ascending: true })
        .limit(5);
      setRows(data ?? []);
    })();
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
            const near = new Date(r.scheduled_at).getTime() - Date.now() < 10 * 60 * 1000
                       && new Date(r.scheduled_at).getTime() > Date.now() - 60 * 60 * 1000;
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
                  {r.mode === "video" && r.room_url && near && (
                    <a href={r.room_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                      <Video className="w-3 h-3" /> Join
                    </a>
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
