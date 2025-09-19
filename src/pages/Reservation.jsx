import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Reservation() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // ✅ 날짜 계산 (내일 ~ 7일 뒤)
        const today = new Date();
        today.setDate(today.getDate() + 1); // 내일
        today.setHours(0, 0, 0, 0);
        const start = today.toISOString().slice(0, 10);

        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 6); // 7일 후
        const end = endDate.toISOString().slice(0, 10);

        // ✅ 파라미터 포함해서 백엔드에 요청
        const res = await axios.get(`/api/schedule?start=${start}&end=${end}`);
        setGames(res.data);
      } catch (err) {
        console.error("경기 일정 조회 실패", err);
      }
    };

    fetchGames();
  }, []);

  // stadiumId를 인자로 받도록 함수 시그니처 변경
  const handleReserveClick = (gameId, stadiumId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      // URL에 stadiumId 파라미터 추가
      navigate(`/reservation/zone?gameId=${gameId}&stadiumId=${stadiumId}`);
    }
  };


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">예매 가능한 경기</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">날짜</th>
            <th className="p-2 border">경기</th>
            <th className="p-2 border">구장</th>
            <th className="p-2 border">예매</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-gray-400 p-4">
                예매 가능한 경기가 없습니다.
              </td>
            </tr>
          ) : (
            games.map((g) => (
              <tr key={g.id}>
                <td className="border p-2">{g.date}</td>
                <td className="border p-2">{g.homeTeam} vs {g.awayTeam}</td>
                <td className="border p-2">{g.stadiumName}</td>
                <td className="border p-2 text-center">
                  <button
                    // g.id와 g.stadiumId를 모두 인자로 전달
                    onClick={() => handleReserveClick(g.id, g.stadiumId)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    예매
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

export default Reservation;
