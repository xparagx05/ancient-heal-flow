import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, RotateCw, X, ArrowLeft, CheckCircle2, IndianRupee } from "lucide-react";
import Navbar from "@/components/dhanvantara/Navbar";
import Footer from "@/components/dhanvantara/Footer";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import { PatientAppointmentsCard, PatientPrescriptionsCard } from "@/components/dhanvantara/PatientCards";
import { Appointment, useBooking } from "@/context/BookingContext";

const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "06:30 PM"];

function isUpcoming(a: Appointment) {
  if (a.status === "cancelled" || a.status === "completed") return false;
  const dt = new Date(`${a.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dt >= today;
}

export default function Dashboard() {
  const { appointments, cancelAppointment, rescheduleAppointment, openVideo, openPayment } = useBooking();
  const [editing, setEditing] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState(slots[0]);

  const upcoming = useMemo(() => appointments.filter(isUpcoming), [appointments]);
  const past = useMemo(() => appointments.filter((a) => !isUpcoming(a)), [appointments]);

  function startEdit(a: Appointment) {
    setEditing(a.id);
    setNewDate(a.date);
    setNewTime(a.time);
  }

  function saveEdit(id: string) {
    rescheduleAppointment(id, newDate, newTime);
    setEditing(null);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-hero">
      <Navbar />
      <EmergencyButton />

      <section className="container mx-auto max-w-6xl px-6 pt-32 pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
            <p className="text-xs tracking-[0.3em] text-primary mb-2">— YOUR DASHBOARD —</p>
            <h1 className="font-display text-5xl md:text-6xl">
              Welcome <span className="text-gradient-gold italic">back</span>
            </h1>
            <p className="text-muted-foreground mt-3">Manage your appointments, payments and care timeline.</p>
          </div>
          <Stats appts={appointments} />
        </div>

        <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-gold animate-pulse" />
          Upcoming appointments
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState message="No upcoming appointments. Book one to get started." />
        ) : (
          <div className="grid gap-4">
            {upcoming.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-xl">{a.doctor}</h3>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{a.specialty}</p>
                  {editing === a.id ? (
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <input
                        type="date"
                        value={newDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-background/60 border border-border text-sm"
                      />
                      <select
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-background/60 border border-border text-sm"
                      >
                        {slots.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <button onClick={() => saveEdit(a.id)} className="px-3 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium">Save</button>
                      <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl glass text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {a.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {a.time}</span>
                      <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> {a.amount}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.status === "pending" && (
                    <button onClick={() => openPayment(a)} className="px-4 py-2 rounded-full bg-gradient-gold text-foreground text-sm font-medium hover:scale-[1.02] transition">
                      Pay ₹{a.amount}
                    </button>
                  )}
                  {a.status === "paid" && (
                    <button onClick={openVideo} className="px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:scale-[1.02] transition">
                      <Video className="w-3.5 h-3.5" /> Join
                    </button>
                  )}
                  <button onClick={() => startEdit(a)} className="px-4 py-2 rounded-full glass text-sm flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button onClick={() => cancelAppointment(a.id)} className="px-4 py-2 rounded-full glass text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <h2 className="font-display text-2xl mt-14 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
          Past appointments
        </h2>
        {past.length === 0 ? (
          <EmptyState message="No past appointments yet." />
        ) : (
          <div className="grid gap-3">
            {past.map((a) => (
              <div key={a.id} className="glass rounded-2xl p-4 flex items-center justify-between opacity-90">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{a.doctor}</h4>
                    <StatusPill status={a.status === "pending" || a.status === "paid" ? "completed" : a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.specialty} · {a.date} · {a.time}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <PatientAppointmentsCard />
          <PatientPrescriptionsCard />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stats({ appts }: { appts: Appointment[] }) {
  const total = appts.length;
  const paid = appts.filter((a) => a.status === "paid").length;
  return (
    <div className="hidden md:flex gap-3">
      <div className="glass rounded-2xl px-5 py-3 text-center">
        <p className="font-display text-2xl text-gradient-gold">{total}</p>
        <p className="text-[10px] tracking-widest text-muted-foreground">TOTAL</p>
      </div>
      <div className="glass rounded-2xl px-5 py-3 text-center">
        <p className="font-display text-2xl text-gradient">{paid}</p>
        <p className="text-[10px] tracking-widest text-muted-foreground">PAID</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Appointment["status"] }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
    paid: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    cancelled: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
    completed: "bg-primary/15 text-primary ring-primary/30",
  } as const;
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${map[status]}`}>{status}</span>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
