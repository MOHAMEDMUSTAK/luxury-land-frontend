import axios from "axios";

let defaultAPI = "http://localhost:5000/api";
if (typeof window !== "undefined") {
  // Use current hostname (localhost or network IP) to reach the API on the same bridge
  defaultAPI = `http://${window.location.hostname}:5000/api`;
}

// Environment variable takes precedence if set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || defaultAPI;

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("WARNING: NEXT_PUBLIC_API_URL is not set in production. Using fallback.");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Reduced from 60s to 15s for normal API calls (faster failure detection)
  withCredentials: true,
});

// Request Interceptor to add JWT Auth Token and handle Content-Type
api.interceptors.request.use(
  (config) => {
    let token = null;
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('luxuryland-auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          token = parsed?.state?.token;
        }
      } catch (e) {
        console.error("Failed to parse auth token", e);
      }
      
      // Fallback
      if (!token) {
        token = localStorage.getItem('luxuryland-auth-token');
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let browser auto-set Content-Type for FormData (multipart/form-data with boundary)
    // For all other requests, default to JSON
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // Use longer timeout for file uploads
      config.timeout = 60000;
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
// ★ CRITICAL: NEVER auto-logout. User requested explicit-only signout.
// 401 errors are silently swallowed — the cached auth state remains untouched.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Do nothing. The user stays logged in from cached state.
      // Only an explicit logout() call from the UI can clear auth.
      // This prevents auto-signout after JWT expiry (2-3 hours).
      console.debug("[API] 401 received — session preserved (explicit logout only)");
    }
    return Promise.reject(error);
  }
);
