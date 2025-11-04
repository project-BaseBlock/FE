// src/api/userApi.js
import axios from "./axiosInstance";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userApi = {
  // 있으면 쓰고(200), 없으면 무시(404/401 시 상위에서 가드)
  async getMe() {
    try {
      const res = await axios.get("/user/me", { headers: authHeader() });
      return res.data; // { email, nickname, walletAddress }
    } catch (e) {
      // /user/me가 없다면 null 리턴해서 폼만 빈값으로 시작
      return null;
    }
  },

  async updateNickname(nickname) {
    const res = await axios.patch(
      "/user/nickname",
      { nickname },
      { headers: authHeader() }
    );
    return res.status === 204;
  },

  async upsertWallet(walletAddress) {
    const res = await axios.patch(
      "/user/wallet",
      { walletAddress },
      { headers: authHeader() }
    );
    return res.status === 204;
  },
};
