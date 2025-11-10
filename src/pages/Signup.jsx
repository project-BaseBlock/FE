import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email || !form.password || !form.passwordConfirm || !form.nickname) {
      return "모든 항목을 입력해 주세요.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "올바른 이메일 형식이 아닙니다.";
    }
    if (form.password.length < 8) {
      return "비밀번호는 8자 이상이어야 합니다.";
    }
    if (form.password !== form.passwordConfirm) {
      return "비밀번호가 일치하지 않습니다.";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    try {
      await axios.post("/user/signup", {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      });
      alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login");
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "회원가입에 실패했습니다.";
      setError(apiMsg);
    }
  };

  // [CHANGED] 입력창 공통 스타일(테두리 추가)
  const inputStyle = {
    width: "100%",
    padding: 8,
    marginTop: 4,
    border: "1px solid #cbd5e1",   // [CHANGED]
    borderRadius: 6,                // [CHANGED]
    backgroundColor: "#fff",
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>회원가입</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            style={inputStyle}      // [CHANGED]
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>닉네임</label>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            placeholder="표시할 닉네임"
            style={inputStyle}      // [CHANGED]
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="8자 이상"
            style={inputStyle}      // [CHANGED]
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="passwordConfirm"
            value={form.passwordConfirm}
            onChange={onChange}
            style={inputStyle}      // [CHANGED]
          />
        </div>

        {error && (
          <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>
        )}

        <button type="submit" style={{ width: "100%", padding: 10 }}>
          회원가입
        </button>
      </form>
    </div>
  );
}

export default Signup;