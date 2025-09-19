import axios from "axios";

const axiosInstance = axios.create({
  // .env: VITE_API_BASE_URL=http://localhost:8080
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: false, // 쿠키 인증 안 쓰면 false 권장
});

// 토큰 헤더 계속 사용
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
