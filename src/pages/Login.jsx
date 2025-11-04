import { useState } from "react";
import axios from "../api/axiosInstance"; // 전역 설정된 axios 인스턴스 사용
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/user/login", {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token); // 토큰 저장
      alert("로그인 성공");

      navigate(from, { replace: true }); // 로그인 후 이동
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>
          로그인
        </button>
      </form>
    </div>
  );
}

export default Login;
