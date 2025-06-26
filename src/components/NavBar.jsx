import { Link } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li><Link to="/">홈</Link></li>
        <li><Link to="/board">게시판</Link></li>
        <li><Link to="/write">글쓰기</Link></li>
        <li><Link to="/admin">관리자</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;