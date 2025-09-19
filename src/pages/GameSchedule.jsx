import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function GameSchedule() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [games, setGames] = useState([]);

  const getFirstLastDay = (year, month) => {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    return { start, end };
  };

  const fetchGames = async (selectedMonth) => {
  const year = new Date().getFullYear();
  const { start, end } = getFirstLastDay(year, selectedMonth);

  try {
    const res = await axios.get(`/api/schedule?start=${start}&end=${end}`);
    console.log("응답:", res.data);
    
    // ✅ 배열인지 체크
    if (Array.isArray(res.data)) {
      setGames(res.data);
    } else {
      console.warn("API 응답이 배열이 아님:", res.data);
      setGames([]);
    }
  } catch (err) {
    console.error("경기 일정 조회 실패", err);
    setGames([]); // 에러 나도 빈 배열로 초기화
  }
};

  useEffect(() => {
    fetchGames(month);
  }, [month]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">경기 일정</h2>
      <label className="mr-2">월 선택:</label>
      <select
        value={month}
        onChange={(e) => setMonth(parseInt(e.target.value))}
        className="border px-2 py-1 mb-4"
      >
        {[...Array(12)].map((_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}월</option>
        ))}
      </select>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">날짜</th>
            <th className="p-2 border">경기</th>
            <th className="p-2 border">구장</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center text-gray-400 p-4">해당 월에 경기 일정이 없습니다.</td>
            </tr>
          ) : (
            games.map((g) => (
              <tr key={g.id}>
                <td className="border p-2">{g.date}</td>
                <td className="border p-2">{g.homeTeam} vs {g.awayTeam}</td>
                <td className="border p-2">{g.stadiumName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GameSchedule;
