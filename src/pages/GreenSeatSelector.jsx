// src/pages/GreenSeatSelector.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import styles from "../styles/GreenSeatSelector.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function GreenSeatSelector() {
  const [selectedCount, setSelectedCount] = useState(1);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [error, setError] = useState("");

  // ✅ 자동 호출/중복 호출 방지 플래그
  const [clicked, setClicked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gameId = searchParams.get("gameId");
  const stadiumId = searchParams.get("stadiumId");
  const zoneName = searchParams.get("zoneName") || "그린";

  const prefix = "g";
  const seatPrice = 10000;

  // 좌석 조회 (계약: zone 파라미터 사용)
  useEffect(() => {
    if (!stadiumId) return;
    axios
      .get(`/api/seats?zone=${encodeURIComponent(zoneName)}&stadiumId=${stadiumId}`)
      .then((res) => {
        const reserved =
          (res.data || [])
            .filter((seat) => seat?.isActive === false) // ✅ undefined/null은 제외
            .map((seat) => seat.number);
        setReservedSeats(reserved);
      })
      .catch(console.error);
  }, [stadiumId, zoneName]);

  // 토스트 자동 닫힘
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 1800);
    return () => clearTimeout(t);
  }, [error]);

  // 10x10 블록 2개 (아래가 1번)
  const blocks = useMemo(() => {
    const makeBlock = (start) => {
      const rows = [];
      let n = start;
      for (let r = 0; r < 10; r++) {
        const row = [];
        for (let c = 0; c < 10; c++) {
          row.push(`${prefix}${String(n).padStart(3, "0")}`);
          n++;
        }
        rows.unshift(row);
      }
      return rows;
    };
    return [makeBlock(1), makeBlock(101)];
  }, []);

  const getSeatGroup = (seat) => {
    for (const block of blocks) {
      for (const row of block) {
        const idx = row.indexOf(seat);
        if (idx === -1) continue;
        if (idx + selectedCount > row.length) return [];
        const group = row.slice(idx, idx + selectedCount);
        if (group.some((s) => reservedSeats.includes(s))) return [];
        return group;
      }
    }
    return [];
  };

  const findSelectedGroup = (seat) => {
    for (const block of blocks) {
      for (const row of block) {
        for (let i = 0; i <= row.length - selectedCount; i++) {
          const group = row.slice(i, i + selectedCount);
          if (group.includes(seat) && group.every((s) => selectedSeats.includes(s))) {
            return group;
          }
        }
      }
    }
    return [];
  };

  const hoveredGroup = hoveredSeat ? getSeatGroup(hoveredSeat) : [];

  const handleClickSeat = (seat) => {
    if (reservedSeats.includes(seat)) {
      setError("예매할 수 없는 좌석입니다.");
      return;
    }
    const selectedGroup = findSelectedGroup(seat);
    if (selectedGroup.length > 0) {
      setSelectedSeats((prev) => prev.filter((s) => !selectedGroup.includes(s)));
      return;
    }
    const group = getSeatGroup(seat);
    if (group.length === 0) {
      setError("좌석을 선택할 수 없습니다.");
      return;
    }
    setSelectedSeats((prev) => [...prev, ...group]);
  };

  // ✅ 진짜 클릭일 때만 POST
  const handleReserve = async () => {
    if (!clicked) return; // 클릭 없이 들어오면 무시
    if (!gameId || !stadiumId) {
      setError("잘못된 접근입니다. (gameId/stadiumId 누락)");
      setClicked(false);
      return;
    }
    if (selectedSeats.length === 0 || submitting) {
      setClicked(false);
      return;
    }

    try {
      setSubmitting(true);
      const body = {
        gameId: Number(gameId),
        stadiumId: Number(stadiumId),
        zoneName,
        seatNumbers: selectedSeats,
      };
      const res = await axios.post("/api/reservations", body);
      const reservationId = res.data.reservationId;

      // ✅ 결제 페이지로 메타 전달: 쿼리 + state + localStorage
      try {
        localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
        localStorage.setItem("selectedZoneName", String(zoneName));
        localStorage.setItem("selectedStadiumId", String(stadiumId));
      } catch {}
      navigate(
        `/payment?reservationId=${reservationId}` +
        `&stadiumId=${stadiumId}` +
        `&zoneName=${encodeURIComponent(zoneName)}` +
        `&seats=${encodeURIComponent(selectedSeats.join(","))}`,
        { state: { stadiumId: Number(stadiumId), zoneName, seatNumbers: selectedSeats } }
      );
    } catch (e) {
      console.error(e);
      setError("예매 요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
      setClicked(false);
    }
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.toast}>{error}</div>}

      <div className={styles.top}>
        <h2 className={styles.title}>좌석 선택 (그린 구역)</h2>
        <label className={styles.dropdownLabel}>
          인원 선택:
          <select
            value={selectedCount}
            onChange={(e) => {
              setSelectedCount(parseInt(e.target.value, 10));
              setSelectedSeats([]);
              setError("");
            }}
            className={styles.dropdown}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}명
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.seatArea}>
        <div className={styles.blocks}>
          <div className={styles.block}>
            {blocks[0].map((row, rIdx) => (
              <div key={`L-${rIdx}`} className={styles.seatRow}>
                {row.map((seat) => (
                  <div
                    key={seat}
                    className={[
                      styles.seat,
                      reservedSeats.includes(seat) ? styles.reserved : "",
                      selectedSeats.includes(seat) ? styles.selected : "",
                      hoveredGroup.includes(seat) ? styles.hovered : "",
                    ].join(" ")}
                    onClick={() => handleClickSeat(seat)}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                  >
                    {seat}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.block}>
            {blocks[1].map((row, rIdx) => (
              <div key={`R-${rIdx}`} className={styles.seatRow}>
                {row.map((seat) => (
                  <div
                    key={seat}
                    className={[
                      styles.seat,
                      reservedSeats.includes(seat) ? styles.reserved : "",
                      selectedSeats.includes(seat) ? styles.selected : "",
                      hoveredGroup.includes(seat) ? styles.hovered : "",
                    ].join(" ")}
                    onClick={() => handleClickSeat(seat)}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                  >
                    {seat}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.fieldLabel}>⚾ 필드</div>
      </div>

      {/* 하단 요약/버튼 - 버튼은 반드시 type="button" */}
      <div className={styles.bottomBar}>
        <div className={styles.selectedWrap}>
          {selectedSeats.length === 0 ? (
            <span className={styles.none}>선택된 좌석 없음</span>
          ) : (
            <span className={styles.selectedText}>
              선택 좌석: {selectedSeats.join(", ")}
            </span>
          )}
        </div>
        <div className={styles.total}>
          총 가격: {(selectedSeats.length * seatPrice).toLocaleString()}원
        </div>
        <button
          type="button"
          className={styles.reserveButton}
          disabled={selectedSeats.length === 0 || submitting}
          onClick={() => {
            setClicked(true);
            handleReserve();
          }}
        >
          {submitting ? "예매 중..." : "예매하기"}
        </button>
      </div>
    </div>
  );
}
