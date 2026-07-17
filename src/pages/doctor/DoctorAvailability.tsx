import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const nav = [
  { to: "/doctor", label: "Overview", icon: <Clock className="w-4 h-4" /> },
  { to: "/doctor/appointments", label: "Appointments", icon: <Clock className="w-4 h-4" /> },
  { to: "/doctor/availability", label: "Availability", icon: <Clock className="w-4 h-4" /> },
];

type Slot = { day_of_week: number; start_time: string; end_time: string };

export default function DoctorAvailability() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("doctor_availability").select("*")
        .eq("doctor_user_id", user.id).order("day_of_week");
      setSlots((data ?? []).map((r: any) => ({ day_of_week: r.day_of_week, start_time: r.start_time, end_time: r.end_time })));
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from("doctor_availability").delete().eq("doctor_user_id", user.id);
      if (slots.length) {
        await supabase.from("doctor_availability").insert(slots.map((s) => ({ ...s, doctor_user_id: user.id })));
      }
      toast.success("Availability saved");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <PortalShell title="Availability" accent="Doctor Portal" nav={nav}>
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-muted-foreground mb-5">Configure your weekly working hours. Patients see these when booking.</p>
        <div className="space-y-2">
          {slots.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <select value={s.day_of_week} onChange={(e) => update(setSlots, slots, i, "day_of_week", Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">
                {DAYS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
              </select>
              <input type="time" value={s.start_time} onChange={(e) => update(setSlots, slots, i, "start_time", e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" />
              <span className="text-muted-foreground">→</span>
              <input type="time" value={s.end_time} onChange={(e) => update(setSlots, slots, i, "end_time", e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" />
              <button onClick={() => setSlots(slots.filter((_, x) => x !== i))} className="text-rose-400 text-xs px-2">Remove</button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setSlots([...slots, { day_of_week: 1, start_time: "09:00", end_time: "17:00" }])}
            className="px-4 py-2 rounded-full glass text-sm hover:bg-white/5">+ Add slot</button>
          <button onClick={save} disabled={busy}
            className="px-4 py-2 rounded-full bg-gradient-gold text-foreground text-sm hover:scale-[1.02] transition disabled:opacity-60">
            {busy ? "Saving…" : "Save availability"}
          </button>
        </div>
      </div>
    </PortalShell>
  );
}

function update<T>(setFn: React.Dispatch<React.SetStateAction<T[]>>, arr: T[], i: number, k: keyof T, v: any) {
  const next = arr.slice(); (next[i] as any)[k] = v; setFn(next);
}
