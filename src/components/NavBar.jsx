// src/components/NavBar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./NavBar.css";
import { getAuthPayload, isAuthenticated, hasAdminRole } from "../utils/auth";

function NavBar() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [payload, setPayload] = useState(getAuthPayload());
  const navigate = useNavigate();
  const location = useLocation();

  // 마운트 시 1회 + 탭 간 동기화 + 같은 탭(커스텀 이벤트) 동기화
  useEffect(() => {
    const update = () => {
      setAuthed(isAuthenticated());
      setPayload(getAuthPayload());
    };
    update();

    // 다른 탭에서 토큰 변경 시 반영
    window.addEventListener("storage", update);
    // 같은 탭에서 토큰 변경 시 반영 (Login/Logout에서 'auth-changed' 디스패치)
    window.addEventListener("auth-changed", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth-changed", update);
    };
  }, []);

  // 라우트가 바뀔 때마다 토큰/페이로드 재평가 (로그인 리다이렉트 직후 반영)
  useEffect(() => {
    setAuthed(isAuthenticated());
    setPayload(getAuthPayload());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
    setPayload(null);
    // 같은 탭 NavBar 즉각 반영
    window.dispatchEvent(new Event("auth-changed"));
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  const isAdmin = hasAdminRole();

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li><Link to="/">홈</Link></li>
        <li><Link to="/board">게시판</Link></li>
        <li><Link to="/write">글쓰기</Link></li>
        <li><Link to="/GameSchedule">경기일정</Link></li>
        <li><Link to="/reservation">예매</Link></li>
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
          <li><Link to="/login">로그인</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
