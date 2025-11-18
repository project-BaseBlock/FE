// src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

export default function PostDetail() {
  const { id } = useParams(); // /board/:id 라우트 기준
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`/posts/${id}`); // 공개 엔드포인트
      setPost(res.data);
    } catch (err) {
      console.error("게시글 조회 실패", err);
      const status = err?.response?.status;
      if (status === 404) alert("글을 찾을 수 없습니다.");
      else alert("게시글을 불러오지 못했습니다.");
      navigate("/board");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/posts/${id}`); // 작성자 or ADMIN/MASTER에 한해 성공
      alert("삭제되었습니다.");
      navigate("/board");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else if (status === 403) {
        alert("삭제 권한이 없습니다. (작성자 또는 ADMIN/MASTER만 가능)");
      } else {
        console.error("삭제 실패", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>📡 게시글 불러오는 중...</p>;
  if (!post) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{post.title}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            to="/board"
            style={{ textDecoration: "none", padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb" }}
          >
            목록
          </Link>
          <button
            onClick={handleDelete}
            style={{ background: "#ef4444", color: "#fff", border: 0, padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
          >
            삭제
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
        <span>작성자: {post.author ?? post.authorEmail ?? "알 수 없음"}</span>
        {post.createdAt && (
          <span style={{ marginLeft: 12 }}>
            작성일: {new Date(post.createdAt).toLocaleString()}
          </span>
        )}
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <span style={{ marginLeft: 12 }}>
            수정일: {new Date(post.updatedAt).toLocaleString()}
          </span>
        )}
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {post.content}
      </div>
    </div>
  );
}
