// Post-consultation feedback modal.
// Writes to `appointment_feedback` and forces the appointment status to `completed`
// so the DB trigger auto-materializes a `consultation_summaries` row.
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function FeedbackModal({
  appointmentId, doctorId, patientId, durationSeconds, onClose,
}: {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  durationSeconds: number;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [issue, setIssue] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    setSubmitting(true);
    try {
      // Look up the doctor_user_id (the feedback table stores that, not doctor_id).
      const { data: appt } = await supabase.from("appointments")
        .select("doctor_user_id").eq("id", appointmentId).maybeSingle();

      const parts: string[] = [];
      if (review) parts.push(`Review: ${review}`);
      if (suggestion) parts.push(`Suggestion: ${suggestion}`);
      if (issue) parts.push(`Issue: ${issue}`);
      parts.push(`Duration: ${Math.round(durationSeconds / 60)} min`);

      const { error } = await supabase.from("appointment_feedback").insert({
        appointment_id: appointmentId,
        doctor_user_id: appt?.doctor_user_id ?? doctorId,
        patient_id: patientId,
        rating,
        comment: parts.join("\n") || null,
      });
      if (error) throw error;

      // Ensure appointment flips to completed if the doctor hasn't done it yet.
      await supabase.from("appointments")
        .update({ status: "completed", ended_at: new Date().toISOString() })
        .eq("id", appointmentId)
        .neq("status", "completed");

      toast.success("Thank you for your feedback!");
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass rounded-3xl p-6 max-w-md w-full"
      >
        <h2 className="font-display text-xl mb-1">How was your consultation?</h2>
        <p className="text-xs text-muted-foreground mb-4">Your feedback helps us improve.</p>

        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1"
              aria-label={`${n} stars`}
            >
              <Star
                className={`w-7 h-7 transition ${
                  (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-white/30"
                }`}
              />
            </button>
          ))}
        </div>

        <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Review</label>
        <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={2}
          placeholder="What went well?"
          className="mt-1 mb-3 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />

        <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Suggestion</label>
        <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={2}
          placeholder="Anything we could improve?"
          className="mt-1 mb-3 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />

        <label className="text-[11px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Report an issue (optional)
        </label>
        <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={2}
          placeholder="Only fill this in if something went wrong"
          className="mt-1 mb-4 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full glass hover:bg-white/5 text-sm">Skip</button>
          <button onClick={submit} disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-foreground text-sm disabled:opacity-60">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
