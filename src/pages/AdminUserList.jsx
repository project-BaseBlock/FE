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
    <div>
      <h3>계정 목록</h3>
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span>
              {user.nickname} ({user.email}) - {user.role}
            </span>
            <button onClick={() => toggleRole(user.id, user.role)}>
              {user.role === "USER" ? "ADMIN 전환" : "USER 전환"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUserList;
