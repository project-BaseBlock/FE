import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

function AdminPostList() {
  const [posts, setPosts] = useState([]); // ✅ 빈 배열로 초기화
  const [loading, setLoading] = useState(true); // 로딩 상태

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/admin/posts");
      console.log("📦 응답 데이터:", res.data);

      // 응답이 배열인지, posts 속성 안에 있는지 확인
      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else if (Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      } else {
        console.error("❌ 알 수 없는 응답 구조:", res.data);
        setPosts([]);
      }
    } catch (err) {
      console.error("❌ 게시글 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("❌ 삭제 실패", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <p>📡 게시글을 불러오는 중...</p>;

  return (
    <div>
      <h3>전체 게시글</h3>
      {Array.isArray(posts) && posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Link to={`/board/${post.id}`} style={{ textDecoration: "none" }}>
                {post.title}
              </Link>
              <button onClick={() => handleDelete(post.id)}>삭제</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>게시글이 없습니다.</p>
      )}
    </div>
  );
}

export default AdminPostList;
