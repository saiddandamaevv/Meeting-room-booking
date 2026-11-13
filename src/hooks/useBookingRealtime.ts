import { useEffect } from "react";

export interface RealtimeEvent {
  type: string;
  occurredAt: string;
  data: Record<string, unknown>;
}

export function useBookingRealtime(onEvent: (event: RealtimeEvent) => void) {
  useEffect(() => {
    if (!("WebSocket" in window)) {
      return;
    }

    const socket = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/v1/ws`,
    );

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as RealtimeEvent;
        if (payload && typeof payload.type === "string") {
          onEvent(payload);
        }
      } catch (error) {
        console.error("Failed to parse realtime event", error);
      }
    };

    socket.onerror = () => {
      console.warn("Realtime connection unavailable");
    };

    return () => {
      socket.close();
    };
  }, [onEvent]);
}
