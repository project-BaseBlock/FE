// src/pages/Admin.jsx
import { useState } from "react";
import axios from "../api/axiosInstance";
import AdminPostList from "./AdminPostList.jsx";
import AdminUserList from "./AdminUserList.jsx";

function Admin() {
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const isMaster =
    token &&
    (() => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role === "MASTER";
      } catch {
        return false;
      }
    })();

  // ✅ 수동 크롤링 실행 함수
  async function handleManualCrawl() {
    if (!window.confirm("정말 수동 크롤링을 실행하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await axios.post("/schedule/manual-test", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data || "✅ 수동 크롤링 완료");
    } catch (e) {
      console.error(e);
      alert("❌ 수동 크롤링 실행 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ 공통 버튼 스타일
  const baseBtn = {
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    color: "#111827",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  };

  const activeBtn = {
    ...baseBtn,
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    fontWeight: "600",
    backgroundColor: "#f0f7ff",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>관리자 페이지</h2>

      {/* ✅ 버튼 구역 */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {/* 글 목록 버튼 */}
        <button
          onClick={() => setActiveTab("posts")}
          style={activeTab === "posts" ? activeBtn : baseBtn}
          onMouseOver={(e) => (e.target.style.border = "1px solid #3b82f6")}
          onMouseOut={(e) =>
            (e.target.style.border =
              activeTab === "posts" ? "1px solid #3b82f6" : "1px solid #d1d5db")
          }
        >
          글 목록
        </button>

        {/* 계정 관리 버튼 */}
        {isMaster && (
          <button
            onClick={() => setActiveTab("users")}
            style={activeTab === "users" ? activeBtn : baseBtn}
            onMouseOver={(e) => (e.target.style.border = "1px solid #3b82f6")}
            onMouseOut={(e) =>
              (e.target.style.border =
                activeTab === "users"
                  ? "1px solid #3b82f6"
                  : "1px solid #d1d5db")
            }
          >
            계정 관리
          </button>
        )}

        {/* ✅ 수동 크롤링 버튼 (같은 스타일로 추가) */}
        {isMaster && (
          <button
            onClick={handleManualCrawl}
            disabled={loading}
            style={activeTab === "crawl" ? activeBtn : baseBtn}
            onMouseOver={(e) => (e.target.style.border = "1px solid #3b82f6")}
            onMouseOut={(e) => (e.target.style.border = "1px solid #d1d5db")}
          >
            {loading ? "⏳ 실행 중..." : "수동 크롤링"}
          </button>
        )}
      </div>

      {/* ✅ 콘텐츠 */}
      {activeTab === "posts" && <AdminPostList />}
      {activeTab === "users" && isMaster && <AdminUserList />}
    </div>
  );
}

export default Admin;
