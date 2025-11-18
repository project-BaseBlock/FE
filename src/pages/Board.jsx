// src/pages/Board.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Board.css";
import { isAuthenticated } from "../utils/auth"; // [CHANGED] 추가

function Board() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/posts", { withCredentials: true }); // 백엔드 호출
        setPosts(res.data || []); // 결과 저장
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        setPosts([]); // 실패 시 빈 목록 표시
      }
    };

    fetchPosts();
  }, []);

  // [CHANGED] 글쓰기 버튼 클릭 핸들러: 비로그인 차단
  const handleWriteClick = () => {
    if (!isAuthenticated()) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    navigate("/write");
  };

  return (
    <div className="board">
      {/* 제목 + 글쓰기 버튼 한 줄 정렬 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 className="board__title">게시판</h2>

        {/* 글쓰기 버튼 */}
        <button
          onClick={handleWriteClick} // [CHANGED]
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ✏️ 글쓰기
        </button>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="board__empty">게시글이 없습니다.</div>
      ) : (
        <ul className="board__list" role="list">
          {posts.map((post) => (
            <li key={post.id} className="board__item">
              <Link to={`/board/${post.id}`} className="board__link">
                <div className="board__main">
                  <strong className="board__titleText">{post.title}</strong>
                  <span className="board__meta">{post.author ?? "익명"}</span>
                </div>
                <span className="board__chevron" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Board;
