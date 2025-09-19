import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

/**
 * props는 SeatRouter.jsx에서 내려줌:
 *   gameId: string|number
 *   stadiumId: string|number
 *   zoneName: "그린" (한글명, 서버 금액 계산에 사용)
 *   zone: "green" (영문 코드가 있을 수도 있음 — 사용하진 않지만 참고)
 */
export default function GreenSeatSelector({ gameId, stadiumId, zoneName /*, zone*/ }) {
  const navigate = useNavigate();

  // 좌석 선택 상태 (프로젝트에 맞춰 기존 좌석 그리드가 toggleSeat를 호출하도록만 맞추면 됨)
  const [selectedSeats, setSelectedSeats] = useState([]); // ex) ["g001","g002","g003"]

  const toggleSeat = (code) => {
    setSelectedSeats((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // 예약 가능 조건 (값 최소 검증)
  const canReserve = useMemo(() => {
    const gid = Number(gameId);
    const sid = Number(stadiumId);
    return (
      Number.isFinite(gid) &&
      Number.isFinite(sid) &&
      typeof zoneName === "string" &&
      zoneName.length > 0 &&
      Array.isArray(selectedSeats) &&
      selectedSeats.length > 0
    );
  }, [gameId, stadiumId, zoneName, selectedSeats]);

  // ✅ 예약 생성 후, 결제 페이지로 이동(메타 전달 보장)
  async function handleReserve() {
    if (!canReserve) {
      alert("예약 정보가 부족합니다. 좌석을 선택했는지 확인하세요.");
      return;
    }

    const payload = {
      gameId: Number(gameId),
      stadiumId: Number(stadiumId),
      zoneName: String(zoneName),
      seatNumbers: selectedSeats, // ["g001","g002",...]
    };

    try {
      // 컨트롤러 경로가 /api/reservations 인지 /reservations 인지 프로젝트에 맞춰 처리
      let res;
      try {
        res = await axios.post("/api/reservations", payload);
      } catch (e1) {
        // 백엔드가 /reservations만 받는 환경 대비 폴백
        res = await axios.post("/reservations", payload);
      }
      const data = res?.data || {};

      // 응답에서 reservationId 추출 (id or reservationId)
      const reservationId = String(data.id ?? data.reservationId ?? "");
      if (!reservationId) {
        console.error("[reserve] invalid response:", data);
        alert("reservationId를 찾을 수 없습니다.");
        return;
      }

      // ✅ PaymentPage가 메타를 어떤 경로로든 주워가도록 백업 저장
      localStorage.setItem("selectedStadiumId", String(stadiumId));
      localStorage.setItem("selectedZoneName", String(zoneName));
      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));

      // ✅ state + 쿼리스트링 둘 다 넣어서 이동 (둘 중 하나 유실되어도 복구됨)
      const qs =
        `reservationId=${encodeURIComponent(reservationId)}` +
        `&stadiumId=${encodeURIComponent(stadiumId)}` +
        `&zoneName=${encodeURIComponent(zoneName)}` +
        `&seats=${encodeURIComponent(selectedSeats.join(","))}`;

      console.log("[Green->Pay] push meta", {
        reservationId,
        stadiumId,
        zoneName,
        seatNumbers: selectedSeats,
      });

      navigate(`/pay?${qs}`, {
        state: {
          reservationId,
          stadiumId: Number(stadiumId),
          zoneName: String(zoneName),
          seatNumbers: selectedSeats,
        },
      });
    } catch (e) {
      console.error("reserve failed", e);
      alert(e?.response?.data?.message || e.message || "예약 생성 실패");
    }
  }

  // (UI 부분은 네 기존 좌석 구성 그대로 쓰고, toggleSeat/handleReserve 연결만 하면 됨)
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">그린 구역 좌석 선택</h2>

      {/* 디버그: 현재 메타 확인 */}
      <pre className="bg-gray-100 p-2 mb-3 text-xs">
        {JSON.stringify({ gameId, stadiumId, zoneName, selectedSeats }, null, 2)}
      </pre>

      {/* 예시 좌석(프로젝트에 있는 기존 좌석 컴포넌트로 교체 가능) */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const code = `g${String(i + 1).padStart(3, "0")}`;
          const active = selectedSeats.includes(code);
          return (
            <button
              key={code}
              onClick={() => toggleSeat(code)}
              className={`px-2 py-1 rounded border ${
                active ? "bg-black text-white" : "bg-white"
              }`}
              type="button"
            >
              {code}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleReserve}
        disabled={!canReserve}
        className={`px-4 py-2 rounded text-white ${
          canReserve ? "bg-black" : "bg-gray-400 cursor-not-allowed"
        }`}
        type="button"
      >
        결제하기(예약 생성)
      </button>
    </div>
  );
}
