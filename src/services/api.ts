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
  timeout: 60000, // Increased to 60 seconds for heavy image uploads
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const tokenInLocal = localStorage.getItem('luxuryland-auth-token');
        const zustandData = localStorage.getItem('luxuryland-auth');
        let hasAuth = !!tokenInLocal;
        
        if (!hasAuth && zustandData) {
          try {
            const parsed = JSON.parse(zustandData);
            hasAuth = !!parsed?.state?.token;
          } catch(e) {}
        }
        
        // ONLY logout if we actually HAD an authentication session
        if (hasAuth) {
          import("@/store/useAuthStore").then((mod) => {
            const store = mod.useAuthStore.getState();
            if (store.isAuthenticated) {
              store.logout();
            }
          });
        }
      }
    }
    return Promise.reject(error);
  }
);
