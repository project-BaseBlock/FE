import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/", // 상대경로로 프록시 타도록 설정
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
