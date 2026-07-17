import { supabase } from "@/integrations/supabase/client";

export type DailyPoint = { date: string; appointments: number; revenue: number };
export type StatusPoint = { status: string; count: number };
export type RatingPoint = { rating: number; count: number };

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export function rangeDays(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

export async function fetchAppointmentsInRange(from: Date, to: Date) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, fee, payment_id, doctor_user_id, doctor_id, patient_id, mode, created_at")
    .gte("scheduled_at", from.toISOString())
    .lte("scheduled_at", to.toISOString())
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function bucketDaily(rows: any[], from: Date, to: Date): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  const cur = new Date(from);
  while (cur <= to) {
    const k = fmt(cur);
    map.set(k, { date: k, appointments: 0, revenue: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  for (const r of rows) {
    const k = fmt(new Date(r.scheduled_at));
    const b = map.get(k);
    if (!b) continue;
    b.appointments += 1;
    if (r.payment_id) b.revenue += r.fee ?? 0;
  }
  return Array.from(map.values());
}

export function statusBreakdown(rows: any[]): StatusPoint[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.status, (m.get(r.status) ?? 0) + 1);
  return Array.from(m.entries()).map(([status, count]) => ({ status, count }));
}

export async function fetchFeedbackDistribution(): Promise<RatingPoint[]> {
  const { data } = await supabase.from("appointment_feedback").select("rating");
  const buckets: RatingPoint[] = [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 }));
  for (const r of data ?? []) {
    const b = buckets.find((x) => x.rating === r.rating);
    if (b) b.count += 1;
  }
  return buckets;
}

export async function topDoctors(from: Date, to: Date) {
  const { data } = await supabase
    .from("appointments")
    .select("doctor_id, fee, payment_id, status")
    .gte("scheduled_at", from.toISOString())
    .lte("scheduled_at", to.toISOString());
  const agg = new Map<string, { doctor_id: string; consults: number; revenue: number }>();
  for (const r of data ?? []) {
    if (!r.doctor_id) continue;
    const cur = agg.get(r.doctor_id) ?? { doctor_id: r.doctor_id, consults: 0, revenue: 0 };
    cur.consults += 1;
    if (r.payment_id) cur.revenue += r.fee ?? 0;
    agg.set(r.doctor_id, cur);
  }
  const ids = Array.from(agg.keys());
  if (!ids.length) return [];
  const { data: docs } = await supabase.from("doctors").select("id, full_name, specialization").in("id", ids);
  const nameMap = new Map((docs ?? []).map((d: any) => [d.id, d]));
  return Array.from(agg.values()).map((v) => ({
    ...v,
    full_name: (nameMap.get(v.doctor_id) as any)?.full_name ?? "—",
    specialization: (nameMap.get(v.doctor_id) as any)?.specialization ?? "",
  }));
}
