import { useEffect, useState } from "react";
import axios from "axios";

function Board() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/posts", { withCredentials: true }); // 백엔드 호출
        setPosts(res.data); // 결과 저장
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>게시판</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <strong>{post.title}</strong> - {post.author}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Board;
