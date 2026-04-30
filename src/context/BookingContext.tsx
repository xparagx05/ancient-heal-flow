import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  phone: string;
  amount: number;
  status: "pending" | "paid" | "cancelled" | "completed";
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  channel: "sms" | "email" | "system";
  read: boolean;
  createdAt: string;
};

type Ctx = {
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, "id" | "createdAt" | "status">) => Appointment;
  markPaid: (id: string) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;

  bookingDoctor: { name: string; specialty: string; price: number } | null;
  openBooking: (d: { name: string; specialty: string; price: number } | null) => void;
  closeBooking: () => void;

  videoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;

  paymentFor: Appointment | null;
  openPayment: (a: Appointment) => void;
  closePayment: () => void;

  notifications: Notification[];
  pushNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
};

const BookingCtx = createContext<Ctx | null>(null);
const KEY = "dhanvantara.appointments";
const NKEY = "dhanvantara.notifications";

export function BookingProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bookingDoctor, setBookingDoctor] = useState<Ctx["bookingDoctor"]>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [paymentFor, setPaymentFor] = useState<Appointment | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setAppointments(JSON.parse(raw));
      const nraw = localStorage.getItem(NKEY);
      if (nraw) setNotifications(JSON.parse(nraw));
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem(NKEY, JSON.stringify(notifications)); }, [notifications]);

  const pushNotification: Ctx["pushNotification"] = (n) => {
    const note: Notification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [note, ...prev].slice(0, 30));
  };

  const addAppointment: Ctx["addAppointment"] = (a) => {
    const appt: Appointment = {
      ...a,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [appt, ...prev]);
    pushNotification({
      title: "Appointment booked",
      message: `Your appointment with ${appt.doctor} is reserved for ${appt.date} at ${appt.time}.`,
      channel: "sms",
    });
    pushNotification({
      title: "Email confirmation",
      message: `📩 Booking details emailed. Complete payment to confirm your slot.`,
      channel: "email",
    });
    toast.success("📩 SMS & Email sent successfully");
    return appt;
  };

  const markPaid = (id: string) => {
    let appt: Appointment | undefined;
    setAppointments((prev) => prev.map((a) => {
      if (a.id === id) { appt = { ...a, status: "paid" }; return appt; }
      return a;
    }));
    if (appt) {
      pushNotification({
        title: "Payment successful",
        message: `✅ ₹${appt.amount} paid. Appointment with ${appt.doctor} confirmed at ${appt.time}, ${appt.date}.`,
        channel: "sms",
      });
      pushNotification({
        title: "Receipt emailed",
        message: `📩 Receipt for ₹${appt.amount} has been sent to your email.`,
        channel: "email",
      });
    }
  };

  const cancelAppointment = (id: string) => {
    let appt: Appointment | undefined;
    setAppointments((prev) => prev.map((a) => {
      if (a.id === id) { appt = { ...a, status: "cancelled" }; return appt; }
      return a;
    }));
    if (appt) {
      pushNotification({
        title: "Appointment cancelled",
        message: `Your appointment with ${appt.doctor} on ${appt.date} has been cancelled.`,
        channel: "system",
      });
      toast.success("Appointment cancelled");
    }
  };

  const rescheduleAppointment = (id: string, date: string, time: string) => {
    let appt: Appointment | undefined;
    setAppointments((prev) => prev.map((a) => {
      if (a.id === id) { appt = { ...a, date, time }; return appt; }
      return a;
    }));
    if (appt) {
      pushNotification({
        title: "Appointment rescheduled",
        message: `Your appointment with ${appt.doctor} is now on ${date} at ${time}.`,
        channel: "sms",
      });
      toast.success("Appointment rescheduled");
    }
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  return (
    <BookingCtx.Provider
      value={{
        appointments, addAppointment, markPaid, cancelAppointment, rescheduleAppointment,
        bookingDoctor,
        openBooking: (d) => setBookingDoctor(d ?? { name: "Any Available Doctor", specialty: "General", price: 499 }),
        closeBooking: () => setBookingDoctor(null),
        videoOpen, openVideo: () => setVideoOpen(true), closeVideo: () => setVideoOpen(false),
        paymentFor, openPayment: (a) => setPaymentFor(a), closePayment: () => setPaymentFor(null),
        notifications, pushNotification, markAllRead, clearNotifications,
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
