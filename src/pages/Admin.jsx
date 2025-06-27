import { useState } from "react";
import AdminPostList from "./AdminPostList.jsx";
import AdminUserList from "./AdminUserList.jsx";

function Admin() {
  const [activeTab, setActiveTab] = useState("posts");

  const token = localStorage.getItem("token");
  const isMaster = token && (() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role === "MASTER";
    } catch {
      return false;
    }
  })();

  return (
    <div style={{ padding: "20px" }}>
      <h2>관리자 페이지</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("posts")} style={{ marginRight: "10px" }}>
          글 목록
        </button>
        {isMaster && (
          <button onClick={() => setActiveTab("users")}>
            계정 관리
          </button>
        )}
      </div>

      {activeTab === "posts" && <AdminPostList />}
      {activeTab === "users" && isMaster && <AdminUserList />}
    </div>
  );
}

export default Admin;
