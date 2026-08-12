import axios from "axios";

// If VITE_API_URL is set, use it. Otherwise use relative '/api' or localhost fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.origin ? `${window.location.origin}/api` : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mam_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("mam_token");
      localStorage.removeItem("mam_user");
    }
    return Promise.reject(error);
  }
);

export default api;
