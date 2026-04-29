import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  phone: string;
  amount: number;
  status: "pending" | "paid";
  createdAt: string;
};

type Ctx = {
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, "id" | "createdAt" | "status">) => Appointment;
  markPaid: (id: string) => void;
  bookingDoctor: { name: string; specialty: string; price: number } | null;
  openBooking: (d: { name: string; specialty: string; price: number } | null) => void;
  closeBooking: () => void;
  videoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
  paymentFor: Appointment | null;
  openPayment: (a: Appointment) => void;
  closePayment: () => void;
};

const BookingCtx = createContext<Ctx | null>(null);
const KEY = "dhanvantara.appointments";

export function BookingProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingDoctor, setBookingDoctor] = useState<Ctx["bookingDoctor"]>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [paymentFor, setPaymentFor] = useState<Appointment | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setAppointments(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment: Ctx["addAppointment"] = (a) => {
    const appt: Appointment = {
      ...a,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [appt, ...prev]);
    return appt;
  };

  const markPaid = (id: string) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "paid" } : a)));

  return (
    <BookingCtx.Provider
      value={{
        appointments,
        addAppointment,
        markPaid,
        bookingDoctor,
        openBooking: (d) => setBookingDoctor(d ?? { name: "Any Available Doctor", specialty: "General", price: 499 }),
        closeBooking: () => setBookingDoctor(null),
        videoOpen,
        openVideo: () => setVideoOpen(true),
        closeVideo: () => setVideoOpen(false),
        paymentFor,
        openPayment: (a) => setPaymentFor(a),
        closePayment: () => setPaymentFor(null),
      }}
    >
      {children}
    </BookingCtx.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
