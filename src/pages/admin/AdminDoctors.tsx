import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MessageCircle, PauseCircle, ExternalLink } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";

type Application = {
  id: string; user_id: string; full_name: string; email: string; phone: string;
  registration_number: string; specialization: string; qualification: string;
  experience_years: number; clinic_name: string | null; consultation_fee: number;
  languages: string[]; working_hours: any; bio: string | null;
  gov_id_url: string | null; license_url: string | null;
  status: "pending" | "approved" | "rejected" | "needs_info" | "suspended";
  admin_notes: string | null; created_at: string;
};

const STATUS_TABS = ["pending", "needs_info", "approved", "rejected", "suspended"] as const;

export default function AdminDoctors() {
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("pending");
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("doctor_applications").select("*").eq("status", tab).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setApps((data as Application[]) ?? []);
  };
  useEffect(() => { load(); }, [tab]);

  const signedUrl = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("doctor-documents").createSignedUrl(path, 300);
    return data?.signedUrl ?? null;
  };
  const [urls, setUrls] = useState<{ gov?: string | null; lic?: string | null }>({});
  useEffect(() => {
    if (!selected) { setUrls({}); return; }
    (async () => setUrls({ gov: await signedUrl(selected.gov_id_url), lic: await signedUrl(selected.license_url) }))();
    setNotes(selected.admin_notes ?? "");
  }, [selected]);

  const action = async (kind: "approve" | "reject" | "needs_info" | "suspend") => {
    if (!selected) return;
    setBusy(true);
    try {
      const map = { approve: "approved", reject: "rejected", needs_info: "needs_info", suspend: "suspended" } as const;
      const { error: e1 } = await supabase.from("doctor_applications").update({
        status: map[kind], admin_notes: notes || null, reviewed_at: new Date().toISOString(),
      }).eq("id", selected.id);
      if (e1) throw e1;

      if (kind === "approve") {
        // Grant doctor role
        const { error: e2 } = await supabase.from("user_roles").insert({ user_id: selected.user_id, role: "doctor" });
        if (e2 && !e2.message.includes("duplicate")) throw e2;

        // Create doctors row
        const { error: e3 } = await supabase.from("doctors").upsert({
          user_id: selected.user_id,
          application_id: selected.id,
          full_name: selected.full_name,
          specialization: selected.specialization,
          qualification: selected.qualification,
          experience_years: selected.experience_years,
          consultation_fee: selected.consultation_fee,
          languages: selected.languages,
          bio: selected.bio,
          is_active: true, verified: true,
        }, { onConflict: "user_id" });
        if (e3) throw e3;
      }
      if (kind === "suspend") {
        await supabase.from("doctors").update({ is_active: false }).eq("user_id", selected.user_id);
      }
      toast.success(`Application ${map[kind]}`);
      setSelected(null);
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PortalShell title="Doctor Verification Center" accent="Admin Control" nav={adminNav}>
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition ${tab === s ? "bg-gradient-gold text-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No applications in this state.</div>
      ) : (
        <div className="grid gap-4">
          {apps.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(a)}
              className="glass rounded-2xl p-5 text-left hover:ring-1 hover:ring-accent/40 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-lg">{a.full_name}</div>
                  <div className="text-xs text-muted-foreground">{a.specialization} · {a.experience_years}y · {a.qualification}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.email} · {a.phone} · Reg #{a.registration_number}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-white/5 uppercase tracking-widest">{a.status.replace("_", " ")}</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md" onClick={() => setSelected(null)}>
          <div className="glass rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl">{selected.full_name}</h3>
                <p className="text-sm text-muted-foreground">{selected.specialization} · {selected.qualification}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
              <Field label="Email" v={selected.email} />
              <Field label="Phone" v={selected.phone} />
              <Field label="Registration #" v={selected.registration_number} />
              <Field label="Experience" v={`${selected.experience_years} years`} />
              <Field label="Clinic" v={selected.clinic_name || "—"} />
              <Field label="Fee" v={`₹${selected.consultation_fee}`} />
              <Field label="Languages" v={selected.languages.join(", ")} />
              <Field label="Hours" v={selected.working_hours?.text ?? "—"} />
            </div>

            {selected.bio && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Bio</div>
                <p className="text-sm">{selected.bio}</p>
              </div>
            )}

            <div className="flex gap-3 mb-5">
              {urls.gov && <a href={urls.gov} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10"><ExternalLink className="w-3 h-3" /> Government ID</a>}
              {urls.lic && <a href={urls.lic} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10"><ExternalLink className="w-3 h-3" /> Medical License</a>}
            </div>

            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Admin notes (shown to applicant if requesting info or rejecting)"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm mb-4" />

            <div className="flex flex-wrap gap-2 justify-end">
              <Btn onClick={() => action("needs_info")} busy={busy} icon={<MessageCircle className="w-4 h-4" />} label="Request info" tone="bg-white/5" />
              <Btn onClick={() => action("reject")} busy={busy} icon={<XCircle className="w-4 h-4" />} label="Reject" tone="bg-rose-500/20 text-rose-200" />
              <Btn onClick={() => action("suspend")} busy={busy} icon={<PauseCircle className="w-4 h-4" />} label="Suspend" tone="bg-amber-500/20 text-amber-200" />
              <Btn onClick={() => action("approve")} busy={busy} icon={<CheckCircle2 className="w-4 h-4" />} label="Approve" tone="bg-gradient-gold text-foreground" />
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

function Field({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div>{v}</div>
    </div>
  );
}
function Btn({ onClick, busy, icon, label, tone }: any) {
  return (
    <button disabled={busy} onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm ${tone} disabled:opacity-50`}>
      {icon} {label}
    </button>
  );
}
