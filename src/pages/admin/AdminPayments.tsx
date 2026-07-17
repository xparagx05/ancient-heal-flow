import { useEffect, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, toCSV } from "@/lib/admin/csv";
import { Download } from "lucide-react";

export default function AdminPayments() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, scheduled_at, fee, payment_id, razorpay_order_id, status, doctor_id, patient_id")
        .not("payment_id", "is", null)
        .order("scheduled_at", { ascending: false })
        .limit(500);
      const rowsData = data ?? [];
      const dIds = Array.from(new Set(rowsData.map((r: any) => r.doctor_id).filter(Boolean)));
      const pIds = Array.from(new Set(rowsData.map((r: any) => r.patient_id).filter(Boolean)));
      const [{ data: docs }, { data: profs }] = await Promise.all([
        dIds.length ? supabase.from("doctors").select("id, full_name").in("id", dIds) : Promise.resolve({ data: [] }),
        pIds.length ? supabase.from("profiles").select("user_id, full_name").in("user_id", pIds) : Promise.resolve({ data: [] }),
      ]);
      const dm = new Map((docs ?? []).map((d: any) => [d.id, d.full_name]));
      const pm = new Map((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      setRows(rowsData.map((r: any) => ({
        ...r,
        doctor_name: dm.get(r.doctor_id) ?? "—",
        patient_name: pm.get(r.patient_id) ?? "—",
      })));
    })();
  }, []);

  const gross = rows.reduce((s, r) => s + (r.fee ?? 0), 0);

  const exportCsv = () => {
    downloadCSV("payments.csv", toCSV(rows.map((r) => ({
      date: r.scheduled_at, patient: r.patient_name, doctor: r.doctor_name,
      amount: r.fee, razorpay_payment_id: r.payment_id, order_id: r.razorpay_order_id, status: r.status,
    }))));
  };

  return (
    <PortalShell title="Payments" accent="Admin Control" nav={adminNav}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Gross revenue</div>
          <div className="font-display text-3xl mt-1">₹{gross.toLocaleString()}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Transactions</div>
          <div className="font-display text-3xl mt-1">{rows.length}</div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Avg ticket</div>
            <div className="font-display text-3xl mt-1">₹{rows.length ? Math.round(gross / rows.length).toLocaleString() : 0}</div>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs uppercase tracking-widest border border-white/10 hover:border-accent hover:text-accent">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground bg-white/5">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Doctor</th>
              <th className="text-right px-4 py-3">Amount (₹)</th>
              <th className="text-left px-4 py-3">Payment ID</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(r.scheduled_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{r.patient_name}</td>
                <td className="px-4 py-3">{r.doctor_name}</td>
                <td className="px-4 py-3 text-right font-mono">{r.fee?.toLocaleString() ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.payment_id}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No paid transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
