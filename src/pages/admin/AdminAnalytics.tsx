import { useEffect, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAppointmentsInRange, bucketDaily, statusBreakdown, fetchFeedbackDistribution, topDoctors, rangeDays,
  type DailyPoint, type StatusPoint, type RatingPoint,
} from "@/lib/admin/analytics";
import { downloadCSV, toCSV } from "@/lib/admin/csv";
import { Download } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#60a5fa",
  confirmed: "#34d399",
  in_progress: "#fbbf24",
  completed: "#10b981",
  cancelled: "#f87171",
};

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [statuses, setStatuses] = useState<StatusPoint[]>([]);
  const [ratings, setRatings] = useState<RatingPoint[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ revenue: 0, consults: 0, avgDuration: 0, avgRating: 0, completion: 0, cancellation: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { from, to } = rangeDays(days);
      const rows = await fetchAppointmentsInRange(from, to);
      const dailyPts = bucketDaily(rows, from, to);
      const statusPts = statusBreakdown(rows);
      const ratingPts = await fetchFeedbackDistribution();
      const docs = await topDoctors(from, to);

      const revenue = rows.filter((r: any) => r.payment_id).reduce((s: number, r: any) => s + (r.fee ?? 0), 0);
      const completed = rows.filter((r: any) => r.status === "completed").length;
      const cancelled = rows.filter((r: any) => r.status === "cancelled").length;
      const total = rows.length || 1;

      const { data: fb } = await supabase.from("appointment_feedback").select("rating");
      const avgRating = fb?.length ? fb.reduce((s: number, r: any) => s + r.rating, 0) / fb.length : 0;

      const durRows = rows.filter((r: any) => r.status === "completed");
      const durIds = durRows.map((r: any) => r.id);
      let avgDur = 0;
      if (durIds.length) {
        const { data: summaries } = await supabase.from("consultation_summaries").select("duration_seconds").in("appointment_id", durIds);
        const durs = (summaries ?? []).map((s: any) => s.duration_seconds).filter(Boolean);
        avgDur = durs.length ? Math.round(durs.reduce((a: number, b: number) => a + b, 0) / durs.length) : 0;
      }

      setDaily(dailyPts);
      setStatuses(statusPts);
      setRatings(ratingPts);
      setDoctors(docs.sort((a, b) => b.consults - a.consults).slice(0, 5));
      setKpi({
        revenue,
        consults: rows.length,
        avgDuration: avgDur,
        avgRating: Math.round(avgRating * 10) / 10,
        completion: Math.round((completed / total) * 100),
        cancellation: Math.round((cancelled / total) * 100),
      });
      setLoading(false);
    })();
  }, [days]);

  const exportCsv = () => {
    downloadCSV(`analytics-${days}d.csv`, toCSV(daily));
  };

  const kpiCards = [
    { label: "Revenue (₹)", value: kpi.revenue.toLocaleString() },
    { label: "Consultations", value: kpi.consults },
    { label: "Avg Duration", value: kpi.avgDuration ? `${Math.round(kpi.avgDuration / 60)}m` : "—" },
    { label: "Avg Rating", value: kpi.avgRating || "—" },
    { label: "Completion %", value: `${kpi.completion}%` },
    { label: "Cancellation %", value: `${kpi.cancellation}%` },
  ];

  return (
    <PortalShell title="Analytics" accent="Admin Control" nav={adminNav}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border transition ${
                days === r.days ? "bg-accent text-background border-accent" : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}>{r.label}</button>
          ))}
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border border-white/10 hover:border-accent hover:text-accent transition">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpiCards.map((k) => (
          <div key={k.label} className="glass rounded-xl p-4">
            <div className="font-display text-2xl">{k.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">Loading analytics…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm mb-4 uppercase tracking-widest text-muted-foreground">Revenue over time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm mb-4 uppercase tracking-widest text-muted-foreground">Appointments per day</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="appointments" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm mb-4 uppercase tracking-widest text-muted-foreground">Status breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statuses} dataKey="count" nameKey="status" outerRadius={80} label={{ fontSize: 10 }}>
                  {statuses.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm mb-4 uppercase tracking-widest text-muted-foreground">Ratings distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ratings}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="rating" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <h3 className="font-display text-sm mb-4 uppercase tracking-widest text-muted-foreground">Top doctors</h3>
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No consultations in this range.</p>
            ) : (
              <div className="space-y-2">
                {doctors.map((d) => (
                  <div key={d.doctor_id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                    <div>
                      <div className="font-medium">{d.full_name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialization}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{d.consults} consults</div>
                      <div className="text-xs text-muted-foreground">₹{d.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalShell>
  );
}
