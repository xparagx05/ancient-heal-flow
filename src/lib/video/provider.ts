// Modular video-consultation provider interface.
// Phase 1 ships the abstraction only. Phase 2 wires a live provider (Daily.co first).

export type VideoRoom = {
  url: string;
  roomName: string;
  expiresAt: string;
};

export interface VideoProvider {
  createRoom(opts: { appointmentId: string; expiresInMinutes?: number }): Promise<VideoRoom>;
  getJoinUrl(opts: { room: VideoRoom; participant: "doctor" | "patient"; displayName: string }): Promise<string>;
}

class UnconfiguredProvider implements VideoProvider {
  async createRoom(): Promise<VideoRoom> {
    throw new Error(
      "Video provider not configured. Set DAILY_API_KEY (or another provider) in backend secrets."
    );
  }
  async getJoinUrl(): Promise<string> {
    throw new Error("Video provider not configured.");
  }
}

// Swap this line to switch providers in Phase 2.
export const videoProvider: VideoProvider = new UnconfiguredProvider();
