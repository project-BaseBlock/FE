// src/pages/AdminUserList.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function AdminUserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("유저 목록 불러오기 실패", err);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const toAdmin = currentRole === "USER";
    const endpoint = toAdmin
      ? `/admin/users/${userId}/grant-admin`
      : `/admin/users/${userId}/revoke-admin`;

    try {
      await axios.patch(endpoint, { withCredentials: true });
      alert("권한이 변경되었습니다.");
      fetchUsers();
    } catch (err) {
      console.error("권한 변경 실패", err);
      alert("권한 변경에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ marginBottom: "12px" }}>계정 목록</h3>

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
              닉네임
            </th>
            <th style={{ padding: "8px", borderRight: "1px solid #e5e7eb" }}>
              이메일
            </th>
            <th style={{ padding: "8px", borderRight: "1px solid #e5e7eb" }}>
              권한
            </th>
            <th style={{ padding: "8px" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "12px",
                  color: "#6b7280",
                }}
              >
                표시할 계정이 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <td style={{ padding: "8px" }}>{user.id}</td>
                <td style={{ padding: "8px" }}>{user.nickname}</td>
                <td style={{ padding: "8px" }}>{user.email}</td>
                <td style={{ padding: "8px" }}>{user.role}</td>
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => toggleRole(user.id, user.role)}
                    style={{
                      backgroundColor: "#fff",
                      color: "#3b82f6",
                      border: "1px solid #3b82f6",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {user.role === "USER" ? "ADMIN 전환" : "USER 전환"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserList;
