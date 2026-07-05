import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, Clock, Phone, Stethoscope, User, Mail } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const doctors = [
  { name: "Dr. Aarav Sharma", specialty: "Cardiologist", price: 799 },
  { name: "Dr. Priya Iyer", specialty: "Dermatologist", price: 599 },
  { name: "Dr. Rohan Mehta", specialty: "Neurologist", price: 999 },
  { name: "Dr. Ananya Rao", specialty: "Pediatrician", price: 499 },
];

const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "06:30 PM"];

export default function BookingModal() {
  const { bookingDoctor, closeBooking, addAppointment } = useBooking();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(bookingDoctor?.name ?? doctors[0].name);
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState(slots[0]);
  const [phone, setPhone] = useState("");

  if (!bookingDoctor) return null;

  const selectedDoc =
    doctors.find((d) => d.name === doctor) ??
    { name: bookingDoctor.name, specialty: bookingDoctor.specialty, price: bookingDoctor.price };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    const appt = addAppointment({
      doctor: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date,
      time,
      phone,
      amount: selectedDoc.price,
    });
    closeBooking();
    setPhone("");
    navigate(`/payment/${appt.id}`);
  }

  function handleClose() {
    closeBooking();
    setTimeout(() => setPhone(""), 300);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center p-4 bg-foreground/40 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg glass rounded-3xl p-7 shadow-2xl"
        >
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center hover:bg-foreground/10 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-4 h-4 text-primary" />
            <p className="text-xs tracking-[0.25em] text-primary">— BOOK APPOINTMENT —</p>
          </div>
          <h3 className="font-display text-3xl mb-6">Reserve your slot</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Doctor</label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-2xl bg-background/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {[selectedDoc, ...doctors.filter((d) => d.name !== selectedDoc.name)].map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} — {d.specialty} (₹{d.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-2xl bg-background/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Time slot</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-2xl bg-background/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {slots.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-2xl bg-background/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-muted-foreground">Consultation fee</span>
              <span className="font-display text-xl text-gradient-gold">₹{selectedDoc.price}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-medium hover:scale-[1.02] transition glow-primary"
            >
              Confirm Appointment → Pay
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              You'll be redirected to a secure payment page.
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
