import axios from "axios";

let defaultAPI = "http://localhost:5000/api";
if (typeof window !== "undefined") {
  // Use current hostname (localhost or network IP) to reach the API on the same bridge
  defaultAPI = `http://${window.location.hostname}:5000/api`;
}

// Environment variable takes precedence if set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || defaultAPI;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for heavy image uploads
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
      // Handle unauthorized explicitly
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('luxuryland-auth-token');
        if (token) {
          // Only trigger if a token actually existed (avoids looping on initial check)
          import("@/store/useAuthStore").then((mod) => {
            mod.useAuthStore.getState().logout();
          });
        }
      }
    }
    return Promise.reject(error);
  }
);
