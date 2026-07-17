import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Best-effort mirror of the legacy localStorage booking flow into Supabase.
 * If the user is signed in AND a real doctor row exists with a matching name,
 * we create/update a real `appointments` row so doctors + admins see the booking
 * live. Otherwise we silently fall back to the legacy local-only behavior.
 */
async function syncApptToSupabase(appt: Appointment): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: doc } = await supabase
      .from("doctors")
      .select("id, user_id")
      .ilike("full_name", appt.doctor)
      .eq("is_active", true)
      .maybeSingle();
    if (!doc) return null;
    const scheduled = new Date(`${appt.date} ${appt.time}`);
    if (isNaN(scheduled.getTime())) return null;
    const { data, error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_id: doc.id,
      doctor_user_id: doc.user_id,
      scheduled_at: scheduled.toISOString(),
      mode: "video",
      fee: appt.amount,
      status: "pending_payment",
      patient_notes: `${appt.name ?? ""} · ${appt.email ?? ""} · ${appt.phone}`,
    }).select("id").single();
    if (error) return null;
    return data.id;
  } catch { return null; }
}

async function markSupaAppointmentPaid(supaId: string, paymentId?: string) {
  try {
    await supabase.from("appointments").update({
      status: "confirmed",
      payment_id: paymentId ?? null,
    }).eq("id", supaId);
  } catch { /* noop */ }
}


export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  phone: string;
  name?: string;
  email?: string;
  amount: number;
  status: "pending" | "paid" | "cancelled" | "completed";
  createdAt: string;
  paymentId?: string;
  orderId?: string;
  receiptId?: string;
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
  markPaid: (id: string, meta?: { paymentId?: string; orderId?: string; receiptId?: string }) => void;
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

  const markPaid: Ctx["markPaid"] = (id, meta) => {
    let appt: Appointment | undefined;
    setAppointments((prev) => prev.map((a) => {
      if (a.id === id) {
        appt = { ...a, status: "paid", ...(meta || {}) };
        return appt;
      }
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
        message: `📩 Receipt for ₹${appt.amount} has been sent to ${appt.email || "your email"}.`,
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
