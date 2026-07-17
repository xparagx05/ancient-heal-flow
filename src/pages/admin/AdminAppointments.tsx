import { useEffect, useMemo, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, toCSV } from "@/lib/admin/csv";
import { Download, Search } from "lucide-react";

const STATUSES = ["all", "scheduled", "confirmed", "in_progress", "completed", "cancelled"];

const badge = (s: string) => {
  const map: Record<string, string> = {
    scheduled: "bg-blue-500/20 text-blue-300",
    confirmed: "bg-emerald-500/20 text-emerald-300",
    in_progress: "bg-amber-500/20 text-amber-300",
    completed: "bg-green-500/20 text-green-300",
    cancelled: "bg-rose-500/20 text-rose-300",
  };
  return `px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${map[s] ?? "bg-white/10"}`;
};

export default function AdminAppointments() {
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, scheduled_at, status, mode, fee, payment_id, doctor_id, patient_id, doctor_user_id")
        .order("scheduled_at", { ascending: false })
        .limit(500);
      const rowsData = data ?? [];
      const dIds = Array.from(new Set(rowsData.map((r: any) => r.doctor_id).filter(Boolean)));
      const pIds = Array.from(new Set(rowsData.map((r: any) => r.patient_id).filter(Boolean)));
      const [{ data: docs }, { data: profs }] = await Promise.all([
        dIds.length ? supabase.from("doctors").select("id, full_name").in("id", dIds) : Promise.resolve({ data: [] }),
        pIds.length ? supabase.from("profiles").select("user_id, full_name, email").in("user_id", pIds) : Promise.resolve({ data: [] }),
      ]);
      const dm = new Map((docs ?? []).map((d: any) => [d.id, d.full_name]));
      const pm = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
      setRows(rowsData.map((r: any) => ({
        ...r,
        doctor_name: dm.get(r.doctor_id) ?? "—",
        patient_name: (pm.get(r.patient_id) as any)?.full_name ?? "—",
        patient_email: (pm.get(r.patient_id) as any)?.email ?? "",
      })));
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!(`${r.patient_name} ${r.patient_email} ${r.doctor_name}`.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [rows, status, q]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const exportCsv = () => {
    downloadCSV("appointments.csv", toCSV(filtered.map((r) => ({
      scheduled_at: r.scheduled_at,
      patient: r.patient_name,
      doctor: r.doctor_name,
      status: r.status,
      mode: r.mode,
      fee: r.fee,
      paid: r.payment_id ? "yes" : "no",
    }))));
  };

  return (
    <PortalShell title="Appointments" accent="Admin Control" nav={adminNav}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border ${status === s ? "bg-accent text-background border-accent" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search patient or doctor"
            className="pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm w-64" />
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs uppercase tracking-widest border border-white/10 hover:border-accent hover:text-accent">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground bg-white/5">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Doctor</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Mode</th>
              <th className="text-right px-4 py-3">Fee (₹)</th>
              <th className="text-left px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(r.scheduled_at).toLocaleString()}</td>
                <td className="px-4 py-3">{r.patient_name}<div className="text-xs text-muted-foreground">{r.patient_email}</div></td>
                <td className="px-4 py-3">{r.doctor_name}</td>
                <td className="px-4 py-3"><span className={badge(r.status)}>{r.status}</span></td>
                <td className="px-4 py-3">{r.mode}</td>
                <td className="px-4 py-3 text-right font-mono">{r.fee?.toLocaleString() ?? "—"}</td>
                <td className="px-4 py-3">{r.payment_id ? <span className="text-emerald-400">Paid</span> : <span className="text-muted-foreground">—</span>}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No appointments match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div>{filtered.length} results</div>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded-md border border-white/10 disabled:opacity-30">Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded-md border border-white/10 disabled:opacity-30">Next</button>
        </div>
      </div>
    </PortalShell>
  );
}
