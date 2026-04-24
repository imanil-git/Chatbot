import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true // Crucial: Tells Axios to always send httpOnly cookies (like refreshToken)
});

// 1. REQUEST INTERCEPTOR: Automatically attach the token to every request
// Why? Instead of manually adding the Authorization header to every single API call (authApi.getMe, chatApi.getMessages, etc.),
// this interceptor intercepts the outgoing request and securely injects the memory-stored access token.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// 2. RESPONSE INTERCEPTOR: Catch 401s and refresh automatically
// Why? When the short-lived access token expires, the backend will return a 401. 
// Instead of kicking the user out immediately, this interceptor pauses the failed request, 
// calls the /refresh endpoint using the httpOnly cookie, gets a new access token, 
// updates the request, and tries again transparently!
apiClient.interceptors.response.use(
  (response) => response, // If the call succeeds, just return the data
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the error is 401 (Unauthorized) and we haven't already retried...
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          // If we are already refreshing, put this request in a queue to wait
          console.log("[FRONTEND AUTH] ⏳ Waiting for token refresh...");
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        console.log("[FRONTEND AUTH] 🔴 Access token expired. Attempting refresh...");
        originalRequest._retry = true; // Mark as retried so we don't loop forever
        isRefreshing = true;

        try {
          // Send request to /refresh endpoint. 
          // Because withCredentials: true, the httpOnly cookie is automatically sent!
          const response = await authApi.refreshToken();
          const newAccessToken = response.data.accessToken; 
          // Note: Backend no longer sends refreshToken in body for security!
          
          console.log("[FRONTEND AUTH] 🟢 Refresh successful! Updating store...");
          const user = useAuthStore.getState().user;
          
          if (user) {
             useAuthStore.getState().setAuth(user, newAccessToken);
          }
          
          // Update the failed request with the new token and try it again
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.log("[FRONTEND AUTH] 🔴 Refresh failed! Session expired or token blacklisted. Logging out...");
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth(); // Wipe memory
          window.location.replace('/login'); // Redirect to log back in
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);
