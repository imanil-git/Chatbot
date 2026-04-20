import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface SessionState {
  sessionId: string;
  initSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: "",

  initSession: () => {
    let storedSession: string =
    localStorage.getItem("antigravity_session_id") || "";

    if (!storedSession) {
      storedSession = uuidv4();
      localStorage.setItem("antigravity_session_id", storedSession);
    }

    set({ sessionId: storedSession });
  },
}));
