import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function RequireAuth({ children }) {
  const authed = isAuthenticated();
  const location = useLocation();

  /* 🔧 StrictMode에서 중복 alert 방지 */
  const alertedRef = useRef(false);
  useEffect(() => {
    if (!authed && !alertedRef.current) {
      alertedRef.current = true;
      alert("로그인이 필요합니다.");
    }
  }, [authed]);

  if (!authed) {
    /* 🔧 전체 location을 state로 넘겨 로그인 후 복귀 경로 복원 */
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
