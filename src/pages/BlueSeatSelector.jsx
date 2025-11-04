// src/pages/BlueSeatSelector.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import styles from "../styles/BlueSeatSelector.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function BlueSeatSelector() {
  const [selectedCount, setSelectedCount] = useState(1);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [error, setError] = useState("");
  const [clicked, setClicked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gameId = searchParams.get("gameId");
  const stadiumId = searchParams.get("stadiumId");
  const zoneName = searchParams.get("zoneName") || "블루";

  const prefix = "b";
  const seatPrice = 20000;

  // ✅ 좌석 조회
  useEffect(() => {
    if (!stadiumId) return;
    axios
      .get(`/seats?zone=${encodeURIComponent(zoneName)}&stadiumId=${stadiumId}`)
      .then((res) => {
        const reserved = (res.data || [])
          .filter((seat) => seat?.isActive === false)
          .map((seat) => seat.number);
        setReservedSeats(reserved);
      })
      .catch(console.error);
  }, [stadiumId, zoneName]);

  // ✅ 오류 자동 닫기
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 1800);
    return () => clearTimeout(t);
  }, [error]);

  // ✅ 좌석 생성 (100석)
  const seatRows = useMemo(() => {
    const rows = [];
    let count = 1;
    for (let r = 0; r < 6; r++) {
      const row = [];
      for (let c = 0; c < 15; c++) row.push(`${prefix}${String(count++).padStart(3, "0")}`);
      rows.unshift(row);
    }
    const topRow = [];
    for (let i = 0; i < 10; i++) topRow.push(`${prefix}${String(count++).padStart(3, "0")}`);
    rows.unshift(topRow);
    return rows;
  }, []);

  // ✅ 다인원 선택 처리
  const getSeatGroup = (seat) => {
    for (const row of seatRows) {
      const idx = row.indexOf(seat);
      if (idx === -1) continue;
      if (idx + selectedCount > row.length) return [];
      const group = row.slice(idx, idx + selectedCount);
      if (group.some((s) => reservedSeats.includes(s))) return [];
      return group;
    }
    return [];
  };
  const findSelectedGroup = (seat) => {
    for (const row of seatRows) {
      for (let i = 0; i <= row.length - selectedCount; i++) {
        const group = row.slice(i, i + selectedCount);
        if (group.includes(seat) && group.every((s) => selectedSeats.includes(s))) return group;
      }
    }
    return [];
  };

  const hoveredGroup = hoveredSeat ? getSeatGroup(hoveredSeat) : [];

  // ✅ 좌석 클릭
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

  // ✅ 예매 및 결제 이동
  const handleReserve = async () => {
    if (!clicked) return;
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
      const res = await axios.post("/reservations", body);
      const reservationId = res.data.reservationId;

      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
      localStorage.setItem("selectedStadiumId", stadiumId);
      localStorage.setItem("selectedZoneName", zoneName);

      navigate(`/payment?reservationId=${reservationId}`, {
        state: { stadiumId: Number(stadiumId), zoneName, seatNumbers: selectedSeats },
      });
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
        <h2 className={styles.title}>좌석 선택 (블루 구역)</h2>
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

      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.seatGrid}>
            {seatRows.map((row, rIdx) => (
              <div key={`B-${rIdx}`} className={styles.seatRow}>
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
          <div className={styles.fieldLabel}>⚾ 필드</div>
        </div>

        <div className={styles.right}>
          <h3>선택한 좌석</h3>
          {selectedSeats.length === 0 ? (
            <p className={styles.none}>선택된 좌석 없음</p>
          ) : (
            <ul className={styles.seatList}>
              {selectedSeats.map((seat) => (
                <li key={seat}>{seat}</li>
              ))}
            </ul>
          )}
          <p className={styles.total}>
            총 가격: {(selectedSeats.length * seatPrice).toLocaleString()}원
          </p>
        </div>
      </div>

      <div className={styles.actionArea}>
        <button
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
