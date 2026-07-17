import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Form = {
  full_name: string; email: string; phone: string;
  registration_number: string; specialization: string; qualification: string;
  experience_years: number; clinic_name: string; consultation_fee: number;
  languages: string; working_hours: string; bio: string;
};

export default function DoctorApply() {
  const { user, session, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState<Form>({
    full_name: "", email: "", phone: "",
    registration_number: "", specialization: "", qualification: "",
    experience_years: 0, clinic_name: "", consultation_fee: 500,
    languages: "English, Hindi", working_hours: "Mon–Fri, 10:00–18:00", bio: "",
  });
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<any>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) { nav("/auth?next=/doctor/apply"); return; }
    setForm((f) => ({ ...f, email: user?.email ?? f.email }));
    (async () => {
      const { data } = await supabase.from("doctor_applications").select("*").eq("user_id", user!.id).maybeSingle();
      if (data) setExisting(data);
    })();
  }, [session, loading, user, nav]);

  const upload = async (file: File, kind: string) => {
    const path = `${user!.id}/${kind}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("doctor-documents").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const gov_id_url = govIdFile ? await upload(govIdFile, "govid") : null;
      const license_url = licenseFile ? await upload(licenseFile, "license") : null;

      const payload = {
        user_id: user.id,
        full_name: form.full_name, email: form.email, phone: form.phone,
        registration_number: form.registration_number, specialization: form.specialization,
        qualification: form.qualification, experience_years: Number(form.experience_years) || 0,
        clinic_name: form.clinic_name || null, consultation_fee: Number(form.consultation_fee) || 0,
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        working_hours: { text: form.working_hours },
        bio: form.bio, gov_id_url, license_url,
        status: "pending" as const,
      };

      const { error } = await supabase.from("doctor_applications").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Application submitted — awaiting admin verification");
      nav("/doctor/pending");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit");
    } finally {
      setBusy(false);
    }
  };

  if (existing && existing.status !== "needs_info") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 max-w-md text-center">
          <h2 className="font-display text-2xl mb-2">Application {existing.status}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {existing.status === "pending" && "Our team is reviewing your application. You'll be notified once approved."}
            {existing.status === "approved" && "Welcome! Your doctor portal is now active."}
            {existing.status === "rejected" && (existing.admin_notes || "Application not approved.")}
            {existing.status === "suspended" && "Your account has been suspended. Contact support."}
          </p>
          <button onClick={() => nav("/doctor")} className="px-5 py-2 rounded-full bg-gradient-gold text-foreground text-sm">
            Continue
          </button>
        </div>
      </div>
    );
  }

  const inp = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm";

  return (
    <div className="min-h-screen py-16 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto glass rounded-3xl p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-2">Doctor Onboarding</p>
        <h1 className="font-display text-3xl mb-1">Apply to join Dhanvantara AI</h1>
        <p className="text-sm text-muted-foreground mb-6">Applications are reviewed by our medical admin team, typically within 24–48 hours.</p>

        {existing?.status === "needs_info" && existing.admin_notes && (
          <div className="mb-6 p-4 rounded-xl border border-amber-400/30 bg-amber-400/5 text-sm">
            <div className="font-medium text-amber-300 mb-1">Additional info requested</div>
            <div className="text-muted-foreground">{existing.admin_notes}</div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Full name" className={inp} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input required type="email" placeholder="Email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required placeholder="Mobile number" className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input required placeholder="Medical Registration Number" className={inp} value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} />
            <input required placeholder="Specialization (e.g. Cardiologist)" className={inp} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <input required placeholder="Qualification (e.g. MBBS, MD)" className={inp} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            <input required type="number" min={0} placeholder="Years of experience" className={inp} value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: +e.target.value })} />
            <input placeholder="Hospital / Clinic (optional)" className={inp} value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} />
            <input required type="number" min={0} placeholder="Consultation fee (₹)" className={inp} value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: +e.target.value })} />
            <input required placeholder="Languages (comma separated)" className={inp} value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
          </div>
          <input required placeholder="Working hours (e.g. Mon–Fri, 10:00–18:00)" className={inp} value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} />
          <textarea required rows={4} placeholder="Short professional bio" className={inp} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1.5">Government ID</span>
              <input type="file" accept="image/*,.pdf" required onChange={(e) => setGovIdFile(e.target.files?.[0] ?? null)} className="text-xs" />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1.5">Medical License</span>
              <input type="file" accept="image/*,.pdf" required onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)} className="text-xs" />
            </label>
          </div>

          <button type="submit" disabled={busy} className="ripple w-full py-3 rounded-full bg-gradient-gold text-foreground font-medium disabled:opacity-60">
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
