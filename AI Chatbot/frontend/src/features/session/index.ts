import { useEffect } from 'react';

export const useSession = () => {
  useEffect(() => {
    console.log("[SESSION] Initializing session...");
    // Future: Connect WebSocket, load history, etc.
  }, []);

  return { isReady: true };
};
