// src/pages/AdminPostList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import { hasAdminRole, getAuthPayload } from "../utils/auth";

function AdminPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = hasAdminRole();
  const payload = getAuthPayload();
  const myEmail = payload?.email;
  const myNickname = payload?.nickname;

  const isMine = (post) =>
    (post.authorEmail && post.authorEmail === myEmail) ||
    (post.author && myNickname && post.author === myNickname);

  const canDelete = (post) => isAdmin || isMine(post);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/posts");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.posts)
        ? res.data.posts
        : [];
      setPosts(data);
    } catch (err) {
      console.error("❌ 게시글 불러오기 실패:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const target = posts.find((p) => p.id === id);
    if (!canDelete(target)) {
      alert("삭제 권한이 없습니다.");
      return;
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("❌ 삭제 실패", err);
      if (err?.response?.status === 403) alert("권한이 없습니다.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <p>📡 게시글을 불러오는 중...</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ marginBottom: "12px" }}>전체 게시글</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #e5e7eb",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #d1d5db",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "8px", borderRight: "1px solid #e5e7eb" }}>
              ID
            </th>
            <th style={{ padding: "8px", borderRight: "1px solid #e5e7eb" }}>
              제목
            </th>
            <th style={{ padding: "8px", borderRight: "1px solid #e5e7eb" }}>
              작성자
            </th>
            <th style={{ padding: "8px", borderRight: "1px solid #e5e7eb" }}>
              작성일
            </th>
            <th style={{ padding: "8px" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "12px",
                  color: "#6b7280",
                }}
              >
                게시글이 없습니다.
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "8px" }}>{post.id}</td>
                <td style={{ padding: "8px" }}>
                  <Link
                    to={`/board/${post.id}`}
                    style={{
                      textDecoration: "none",
                      color: "#1d4ed8",
                    }}
                  >
                    {post.title}
                  </Link>
                </td>
                <td style={{ padding: "8px" }}>
                  {post.author ?? post.authorEmail ?? "익명"}
                </td>
                <td style={{ padding: "8px" }}>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td style={{ padding: "8px" }}>
                  {canDelete(post) && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{
                        backgroundColor: "#fff",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPostList;
