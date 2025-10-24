// src/pages/GameSchedule.jsx  // (= 경기·결과 페이지로 재활용)
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function GameSchedule() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [games, setGames] = useState([]);

  const toYmd = (d) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const getFirstLastDay = (y, m) => {
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return { start: toYmd(start), end: toYmd(end) };
  };

  const renderResult = (g) => {
    if (typeof g.homeScore === "number" && typeof g.awayScore === "number") {
      return `${g.homeScore} : ${g.awayScore}`;
    }
    if (g.result && g.result.trim().length > 0) return g.result;
    return "—";
  };

  const fetchGames = async (y, m) => {
    const { start, end } = getFirstLastDay(y, m);
    try {
      // ⚠️ 백엔드가 /games라면 아래 URL을 "/games"로 바꾸세요.
      const res = await axios.get(`/api/schedule`, { params: { start, end } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setGames(Array.isArray(data) ? data : []);
      console.log("응답:", data);
    } catch (err) {
      console.error("경기 일정 조회 실패", err);
      setGames([]);
    }
  };

  useEffect(() => {
    fetchGames(year, month);
  }, [year, month]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">경기·결과</h2>

      <div className="flex items-center gap-2 mb-4">
        <label className="mr-2">연/월 선택:</label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="border px-2 py-1"
        >
          {[...Array(3)].map((_, i) => {
            const yy = new Date().getFullYear() - 1 + i;
            return (
              <option key={yy} value={yy}>{yy}년</option>
            );
          })}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="border px-2 py-1"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}월</option>
          ))}
        </select>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">날짜</th>
            <th className="p-2 border">경기</th>
            <th className="p-2 border">결과</th>{/* ⬅️ 결과 컬럼 추가 */}
            <th className="p-2 border">구장</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-gray-400 p-4">
                해당 월에 경기 결과가 없습니다.
              </td>
            </tr>
          ) : (
            games.map((g) => {
              const id = g.gameId ?? g.id;
              const home = g.homeTeamName ?? g.homeTeam;
              const away = g.awayTeamName ?? g.awayTeam;
              return (
                <tr key={id}>
                  <td className="border p-2">{g.date}</td>
                  <td className="border p-2">{home} vs {away}</td>
                  <td className="border p-2">{renderResult(g)}</td>
                  <td className="border p-2">{g.stadiumName}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GameSchedule;
