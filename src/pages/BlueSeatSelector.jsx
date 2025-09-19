import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import styles from "../styles/BlueSeatSelector.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function BlueSeatSelector() {
  const [selectedCount, setSelectedCount] = useState(1);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const gameId = searchParams.get("gameId");

  const prefix = "a";
  const zone = "blue";
  const seatPrice = 20000;

  useEffect(() => {
    axios
      .get(`/api/seats?zone=${zone}`)
      .then((res) => {
        const reserved = res.data
          .filter((seat) => !seat.isActive)
          .map((seat) => seat.number);
        setReservedSeats(reserved);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleReserve = async () => {
    try {
      const response = await axios.post("/api/reservations", {
        gameId: parseInt(gameId),
        seatNumbers: selectedSeats
      });
      const reservationId = response.data.reservationId;
      // ✅ 다음 단계로 이동 (결제 페이지 or 예약 완료 대기)
      navigate(`/payment?reservationId=${reservationId}`);
    } catch (err) {
      setError("예매 요청에 실패했습니다.");
      console.error(err);
    }
  };

  const generateSeats = () => {
    const rows = [];
    let count = 1;

    for (let r = 0; r < 6; r++) {
      const row = [];
      for (let c = 0; c < 15; c++) {
        row.push(`${prefix}${String(count).padStart(3, "0")}`);
        count++;
      }
      rows.unshift(row);
    }

    const topRow = [];
    for (let i = 0; i < 10; i++) {
      topRow.push(`${prefix}${String(count).padStart(3, "0")}`);
      count++;
    }
    rows.unshift(topRow);

    return rows;
  };

  const seatRows = generateSeats();
  const allSeats = seatRows.flat();

  const findSelectedGroup = (seat) => {
    for (const row of seatRows) {
      for (let i = 0; i <= row.length - selectedCount; i++) {
        const group = row.slice(i, i + selectedCount);
        if (group.includes(seat) && group.every((s) => selectedSeats.includes(s))) {
          return group;
        }
      }
    }
    return [];
  };

  const getSeatGroup = (seat) => {
    for (const row of seatRows) {
      const seatIdx = row.indexOf(seat);
      if (seatIdx === -1) continue;
      if (seatIdx + selectedCount > row.length) return [];

      const group = row.slice(seatIdx, seatIdx + selectedCount);
      if (group.some((s) => reservedSeats.includes(s))) return [];
      return group;
    }
    return [];
  };

  const hoveredGroup = hoveredSeat ? getSeatGroup(hoveredSeat) : [];

  const handleClick = (seat) => {
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

  return (
    <div className={styles.container}>
      {error && <div className={styles.toast}>{error}</div>}

      <div className={styles.top}>
        <h2 className={styles.title}>좌석 선택 (Blue 구역)</h2>
        <label className={styles.dropdownLabel}>
          인원 선택:
          <select
            value={selectedCount}
            onChange={(e) => {
              setSelectedCount(parseInt(e.target.value));
              setSelectedSeats([]);
              setError("");
            }}
            className={styles.dropdown}
          >
            {[1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count}명
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.seatGrid}>
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.seatRow}>
                {row.map((seat) => (
                  <div
                    key={seat}
                    className={`${styles.seat}
                      ${reservedSeats.includes(seat) ? styles.reserved : ""}
                      ${selectedSeats.includes(seat) ? styles.selected : ""}
                      ${hoveredGroup.includes(seat) ? styles.hovered : ""}
                    `}
                    onClick={() => handleClick(seat)}
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
                disabled={selectedSeats.length === 0}
                onClick={handleReserve}
              >
                예매하기
              </button>
            </div>
    </div>
  );
}
