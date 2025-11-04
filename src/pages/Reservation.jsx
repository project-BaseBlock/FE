import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Reservation() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  // YYYY-MM-DD (로컬 기준)
  const toYmd = (d) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const addDays = (d, days) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  };

  // 접속한 '월'의 1일~말일
  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toYmd(start), end: toYmd(end) };
  };

  useEffect(() => {
    const fetchMonth = async () => {
      try {
        const { start, end } = getCurrentMonthRange();

        // ⚠️ 백엔드 엔드포인트가 /games 라면 아래 URL을 "/games"로 바꿔주세요.
        const res = await axios.get(`/schedule`, { params: { start, end } });

        const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
        setGames(data);
      } catch (err) {
        console.error("경기 일정 조회 실패", err);
        setGames([]);
      }
    };
    fetchMonth();
  }, []);

  const handleReserveClick = (gameId, stadiumId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      navigate(`/reservation/zone?gameId=${gameId}&stadiumId=${stadiumId}`);
    }
  };

  // ✅ 버튼 활성: '문자열'로 날짜 비교 (타임존 영향 제거)
  //    내일 ~ 내일+6일(총 7일) + status != END
  const isReservable = (row) => {
    try {
      // 백엔드가 reservable 내려주면 그대로 신뢰
      if (typeof row.reservable === "boolean") {
        return row.reservable;
      }

      const today = new Date();
      const tomorrowStr = toYmd(addDays(today, 1));
      const lastStr = toYmd(addDays(today, 7)); // 내일(+1) + 6일 = 오늘 기준 +7

      const d = row.date; // 'YYYY-MM-DD'
      const inRange = d >= tomorrowStr && d <= lastStr;
      const notEnded = row.status ? row.status !== "END" : true;

      return inRange && notEnded;
    } catch {
      return false;
    }
  };

  const renderResult = (g) => {
    if (typeof g.homeScore === "number" && typeof g.awayScore === "number") {
      return `${g.homeScore} : ${g.awayScore}`;
    }
    if (g.result && g.result.trim().length > 0) return g.result;
    return "—";
  };

  return (
    <div className="p-4" style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div
        style={{
          border: "1px dashed #9ca3af",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          background: "#f9fafb",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        <b>진행중 스코어</b> (placeholder)
      </div>

      <h2 className="text-xl font-bold mb-4">경기·예매</h2>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">날짜</th>
            <th className="p-2 border">경기</th>
            <th className="p-2 border">구장</th>
            <th className="p-2 border">결과</th>
            <th className="p-2 border">예매</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-gray-400 p-4">
                표시할 일정이 없습니다.
              </td>
            </tr>
          ) : (
            games.map((g) => {
              const id = g.gameId ?? g.id;
              const home = g.homeTeamName ?? g.homeTeam;
              const away = g.awayTeamName ?? g.awayTeam;
              const canReserve = isReservable(g);

              return (
                <tr key={id}>
                  <td className="border p-2">{g.date}</td>
                  <td className="border p-2">{home} vs {away}</td>
                  <td className="border p-2">{g.stadiumName}</td>
                  <td className="border p-2">{renderResult(g)}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleReserveClick(id, g.stadiumId)}
                      disabled={!canReserve}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded"
                    >
                      예매
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Reservation;
