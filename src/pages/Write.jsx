import { useState } from "react";
import axios from "../api/axiosInstance"; // 토큰 자동 포함
import { useNavigate } from "react-router-dom";

function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/posts/new", { title, content }); // 인증은 헤더로 자동 포함
      alert("글이 작성되었습니다.");
      navigate("/board");
    } catch (error) {
      console.error("글 작성 실패:", error);
      alert("글 작성에 실패했습니다.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>글쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <textarea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="10"
            style={{ width: "100%", padding: "8px" }}
          ></textarea>
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>
          작성하기
        </button>
      </form>
    </div>
  );
}

export default Write;
