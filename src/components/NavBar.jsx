import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./NavBar.css";
import { getAuthPayload, isAuthenticated, hasAdminRole } from "../utils/auth";

function NavBar() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [payload, setPayload] = useState(getAuthPayload());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      setAuthed(isAuthenticated());
      setPayload(getAuthPayload());
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("auth-changed", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth-changed", update);
    };
  }, []);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setPayload(getAuthPayload());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
    setPayload(null);
    window.dispatchEvent(new Event("auth-changed"));
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  const isAdmin = hasAdminRole();

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li><Link to="/">경기·예매</Link></li>
        <li><Link to="/board">게시판</Link></li>
        <li><Link to="/results">경기·결과</Link></li>
        {isAdmin && <li><Link to="/admin">관리자 페이지</Link></li>}

        {authed ? (
          <>
            <li><Link to="/mypage">마이페이지</Link></li>
            <li>
              <span style={{ color: "gray" }}>
                {payload?.nickname || payload?.email || "로그인됨"}
              </span>
            </li>
            <li><button onClick={handleLogout}>로그아웃</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">로그인</Link></li>
            {/* [ADDED] 비로그인일 때만 노출되는 회원가입 버튼 */}
            <li><Link to="/signup" className="btn-signup">회원가입</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
