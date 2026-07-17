// Patient/doctor video-consultation experience.
// The Daily SDK is lazy-imported so it never enters the homepage bundle.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, Loader2, ShieldCheck, Clock, User as UserIcon, Wifi, WifiOff, MessageSquare, ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import FeedbackModal from "./FeedbackModal";

type Ready = {
  role: "doctor" | "patient";
  room: { url: string; name: string; expiresAt: string };
  token: string;
  displayName: string;
  appointment: { id: string; scheduledAt: string; durationMin: number; status: string };
};

export default function ConsultationRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"loading" | "waiting" | "in_call" | "ended" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [opensAt, setOpensAt] = useState<string | null>(null);
  const [ready, setReady] = useState<Ready | null>(null);
  const [appt, setAppt] = useState<any>(null);
  const [counterparty, setCounterparty] = useState<{ name: string; role: string } | null>(null);

  // Local device preview state (before joining).
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const previewStream = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [deviceOk, setDeviceOk] = useState<boolean | null>(null);

  const callFrameRef = useRef<any>(null);
  const callWrapRef = useRef<HTMLDivElement | null>(null);
  const [inCallSince, setInCallSince] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // -------- Load appointment + counterparty for the waiting room. --------
  useEffect(() => {
    if (!appointmentId || !user) return;
    (async () => {
      const { data: a } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();
      if (!a) { setPhase("error"); setErrorMsg("Appointment not found."); return; }
      setAppt(a);
      const iAmDoctor = a.doctor_user_id === user.id;
      if (iAmDoctor) {
        const { data: p } = await supabase.from("profiles").select("full_name, email").eq("user_id", a.patient_id).maybeSingle();
        setCounterparty({ name: p?.full_name ?? p?.email ?? "Patient", role: "Patient" });
      } else {
        const { data: d } = await supabase.from("doctors").select("full_name, specialization").eq("id", a.doctor_id).maybeSingle();
        setCounterparty({ name: `Dr. ${d?.full_name ?? "Doctor"}`, role: d?.specialization ?? "Doctor" });
      }
      setPhase("waiting");
    })();
  }, [appointmentId, user]);

  // -------- Device preview setup. --------
  useEffect(() => {
    if (phase !== "waiting") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        previewStream.current = stream;
        if (previewRef.current) {
          previewRef.current.srcObject = stream;
          await previewRef.current.play().catch(() => {});
        }
        setDeviceOk(true);
      } catch (e: any) {
        setDeviceOk(false);
      }
    })();
    return () => {
      cancelled = true;
      previewStream.current?.getTracks().forEach(t => t.stop());
      previewStream.current = null;
    };
  }, [phase]);

  const toggleMic = () => {
    const s = previewStream.current;
    if (!s) return;
    const on = !micOn;
    s.getAudioTracks().forEach(t => (t.enabled = on));
    setMicOn(on);
  };
  const toggleCam = () => {
    const s = previewStream.current;
    if (!s) return;
    const on = !camOn;
    s.getVideoTracks().forEach(t => (t.enabled = on));
    setCamOn(on);
  };

  // -------- Ask server for a Daily room + meeting token, then join. --------
  const joinConsultation = async () => {
    if (!appointmentId) return;
    try {
      setPhase("loading");
      const { data, error } = await supabase.functions.invoke("create-daily-room", {
        body: { appointmentId },
      });
      if (error) throw new Error(error.message);
      const payload = data as any;
      if (payload?.configured === false) {
        setPhase("error");
        setErrorMsg(payload.error ?? "Video is not configured yet.");
        return;
      }
      if (payload?.error === "waiting") {
        setOpensAt(payload.opensAt ?? null);
        setPhase("waiting");
        toast.info(payload.message ?? "Consultation not yet open");
        return;
      }
      if (payload?.error) throw new Error(payload.error);

      const r = payload as Ready;
      setReady(r);

      // Free the preview stream so Daily can grab the devices.
      previewStream.current?.getTracks().forEach(t => t.stop());
      previewStream.current = null;

      // Dynamically import so the SDK stays out of the main bundle.
      const DailyIframe = (await import("@daily-co/daily-js")).default;
      if (!callWrapRef.current) return;
      const frame = DailyIframe.createFrame(callWrapRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          position: "absolute", top: "0", left: "0",
          width: "100%", height: "100%", border: "0", borderRadius: "16px",
        },
        theme: {
          colors: {
            accent: "#c4a76a",
            accentText: "#0a0a0a",
            background: "#0a0a0a",
            backgroundAccent: "#111",
            baseText: "#ffffff",
            border: "#222",
            mainAreaBg: "#0a0a0a",
            mainAreaBgAccent: "#111",
            mainAreaText: "#ffffff",
            supportiveText: "#9ca3af",
          },
        },
      });
      callFrameRef.current = frame;

      frame.on("left-meeting", handleLeave);
      frame.on("error", (ev: any) => {
        console.error("[daily]", ev);
        toast.error(ev?.errorMsg ?? "Video error");
      });

      await frame.join({
        url: r.room.url, token: r.token, userName: r.displayName,
        startVideoOff: !camOn, startAudioOff: !micOn,
      });
      setInCallSince(Date.now());
      setPhase("in_call");
    } catch (e: any) {
      setPhase("error");
      setErrorMsg(e.message ?? "Failed to join consultation");
    }
  };

  // -------- Call timer. --------
  useEffect(() => {
    if (!inCallSince) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - inCallSince) / 1000)), 1000);
    return () => clearInterval(t);
  }, [inCallSince]);

  const timerLabel = useMemo(() => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const s = (elapsed % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [elapsed]);

  // -------- Handle leaving: doctor → finalize; patient → feedback modal. --------
  const handleLeave = async () => {
    try { await callFrameRef.current?.leave(); } catch {}
    try { callFrameRef.current?.destroy(); } catch {}
    callFrameRef.current = null;

    if (!appt || !user) { setPhase("ended"); return; }
    const iAmDoctor = appt.doctor_user_id === user.id;
    if (iAmDoctor) {
      // Doctor lands back in the consultation workspace to finish notes / PDF.
      navigate(`/doctor/consultations/${appt.id}`);
      return;
    }
    // Patient: prompt feedback.
    setPhase("ended");
    setShowFeedback(true);
  };

  const cleanup = () => {
    try { callFrameRef.current?.destroy(); } catch {}
    previewStream.current?.getTracks().forEach(t => t.stop());
  };
  useEffect(() => () => cleanup(), []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (phase === "loading") {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-3xl p-8 max-w-md text-center">
          <h1 className="font-display text-xl mb-2">Cannot join consultation</h1>
          <p className="text-sm text-muted-foreground mb-4">{errorMsg}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-full glass hover:bg-white/5 text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  if (phase === "in_call") {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold grid place-items-center text-black text-xs font-bold">D</div>
            <div>
              <div className="text-sm font-medium">{counterparty?.name}</div>
              <div className="text-[11px] text-white/60">{counterparty?.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {timerLabel}</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Encrypted</span>
            <button onClick={handleLeave} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-xs">
              <PhoneOff className="w-3 h-3" /> End
            </button>
          </div>
        </div>
        <div ref={callWrapRef} className="relative flex-1" />
      </div>
    );
  }

  // Ended (patient path) — feedback modal shows on top.
  if (phase === "ended") {
    return (
      <>
        <div className="min-h-screen grid place-items-center p-6">
          <div className="glass rounded-3xl p-8 max-w-md text-center">
            <h1 className="font-display text-xl mb-2">Consultation complete</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Thank you. Your prescription will appear on your dashboard shortly.
            </p>
            <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-full bg-gradient-gold text-foreground text-sm">
              Go to dashboard
            </button>
          </div>
        </div>
        {showFeedback && appt && (
          <FeedbackModal
            appointmentId={appt.id}
            doctorId={appt.doctor_id}
            patientId={appt.patient_id}
            durationSeconds={elapsed}
            onClose={() => { setShowFeedback(false); navigate("/dashboard"); }}
          />
        )}
      </>
    );
  }

  // Waiting room
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Waiting Room</div>
          <h1 className="font-display text-2xl mt-1">You're joining a consultation with</h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-primary/10 grid place-items-center">
              <UserIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-medium">{counterparty?.name ?? "…"}</div>
              <div className="text-xs text-muted-foreground">{counterparty?.role}</div>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <Row icon={<Clock className="w-4 h-4 text-accent" />} label="Scheduled">
              {appt ? new Date(appt.scheduled_at).toLocaleString() : "…"}
            </Row>
            <Row icon={deviceOk ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />} label="Devices">
              {deviceOk === null ? "Checking…" : deviceOk ? "Camera & microphone ready" : "Please allow camera & microphone access"}
            </Row>
            <Row icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} label="Security">
              End-to-end encrypted room via Daily.co
            </Row>
          </div>

          {opensAt && (
            <p className="mt-4 text-xs text-amber-300/90">
              The consultation opens at {new Date(opensAt).toLocaleTimeString()}.
            </p>
          )}

          <button
            onClick={joinConsultation}
            disabled={deviceOk !== true}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-gold text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition"
          >
            <Video className="w-4 h-4" /> Join consultation
          </button>
          <p className="mt-2 text-[11px] text-center text-muted-foreground">
            Available from 15 minutes before your appointment.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Camera preview</div>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/10">
            <video ref={previewRef} playsInline muted className="w-full h-full object-cover" />
            {!camOn && (
              <div className="absolute inset-0 grid place-items-center bg-black/70 text-sm text-muted-foreground">
                Camera off
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={toggleMic}
              className={`w-11 h-11 rounded-full grid place-items-center ${micOn ? "bg-white/10 hover:bg-white/15" : "bg-rose-500/20 text-rose-400"}`}>
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button onClick={toggleCam}
              className={`w-11 h-11 rounded-full grid place-items-center ${camOn ? "bg-white/10 hover:bg-white/15" : "bg-rose-500/20 text-rose-400"}`}>
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-center text-muted-foreground inline-flex items-center gap-1 justify-center w-full">
            <MessageSquare className="w-3 h-3" /> In-call chat, screenshare and controls appear once you join.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="w-6">{icon}</span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground w-24">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
