import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    const msg = e?.response?.data?.message || e.message || "Request error";
    console.error("[API ERROR]", msg, e?.response);
    return Promise.reject(e);
  }
);
