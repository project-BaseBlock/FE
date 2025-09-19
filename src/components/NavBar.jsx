import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./NavBar.css";

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // ✅ 사용자 권한 저장
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role); // ✅ role 추출
      } catch (e) {
        console.error("토큰 파싱 실패", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  const isAdmin = userRole === "ADMIN" || userRole === "MASTER";

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li><Link to="/">홈</Link></li>
        <li><Link to="/board">게시판</Link></li>
        <li><Link to="/write">글쓰기</Link></li>
        <li><Link to="/GameSchedule">경기일정</Link></li>
        <li><Link to="/reservation">예매</Link></li>
        {isAdmin && <li><Link to="/admin">관리자 페이지</Link></li>}

        {isLoggedIn ? (
          <>
            <li><span style={{ color: "gray" }}>로그인됨</span></li>
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
