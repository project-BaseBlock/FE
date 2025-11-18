import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, hasAdminRole } from "../utils/auth";

export default function RequireAdmin({ children }) {
  const location = useLocation();
  const ok = isAuthenticated() && hasAdminRole();

  /* StrictMode 중복 alert 방지 */
  const alertedRef = useRef(false);
  useEffect(() => {
    if (!ok && !alertedRef.current) {
      alertedRef.current = true;
      alert("관리자 권한이 필요합니다.");
    }
  }, [ok]);

  if (!ok) {
    /* 권한 부족 시 홈으로. 필요하면 /login으로 바꿔도 됨 */
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}
