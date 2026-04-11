import axios from 'axios';
import { useSessionStore } from '../features/session/store/session.store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const sessionId = useSessionStore.getState().sessionId;
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.error('Unauthorized request');
      } else if (status === 429) {
        console.error('Too many requests');
      } else if (status >= 500) {
        console.error('Server error');
      }
    }
    return Promise.reject(error);
  }
);
