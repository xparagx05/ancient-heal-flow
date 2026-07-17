// Modular video-consultation provider interface.
// Phase 2B.2: Daily.co is wired via the create-daily-room edge function.
// A future provider (Twilio, Jitsi) implements the same interface and swaps in below.
import { supabase } from "@/integrations/supabase/client";

export type VideoRoom = { url: string; roomName: string; expiresAt: string };
export type VideoJoinPayload = {
  role: "doctor" | "patient";
  room: VideoRoom;
  token: string;
  displayName: string;
};

export interface VideoProvider {
  /** Returns a room + short-lived meeting token if the caller is authorized to join. */
  joinAppointment(appointmentId: string): Promise<VideoJoinPayload>;
}

class DailyProvider implements VideoProvider {
  async joinAppointment(appointmentId: string): Promise<VideoJoinPayload> {
    const { data, error } = await supabase.functions.invoke("create-daily-room", {
      body: { appointmentId },
    });
    if (error) throw new Error(error.message);
    const payload = data as any;
    if (payload?.configured === false) throw new Error(payload.error ?? "Video not configured");
    if (payload?.error) throw new Error(payload.error);
    return {
      role: payload.role,
      room: { url: payload.room.url, roomName: payload.room.name, expiresAt: payload.room.expiresAt },
      token: payload.token,
      displayName: payload.displayName,
    };
  }
}

// Swap this line to switch providers.
export const videoProvider: VideoProvider = new DailyProvider();
