import { useEffect } from 'react';
import { useSessionStore } from '../store/session.store';

export const useSession = () => {
  const initSession = useSessionStore(state => state.initSession);
  const sessionId = useSessionStore(state => state.sessionId);

  useEffect(() => {
    initSession();
  }, [initSession]);

  return { sessionId };
};
