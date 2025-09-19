import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import styles from "../styles/RedSeatSelector.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function RedSeatSelector() {
    const [selectedCount, setSelectedCount] = useState(1);
    const [reservedSeats, setReservedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hoveredSeat, setHoveredSeat] = useState(null);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const gameId = searchParams.get("gameId");
    const stadiumId = searchParams.get("stadiumId"); // ✅ stadiumId를 URL 파라미터에서 가져옴

    const prefix = "r"; // ✅ 좌석 접두사를 "r"로 변경
    const zoneName = "레드"; // ✅ zoneName을 "레드"로 정의
    const seatPrice = 20000;

    useEffect(() => {
        if (!stadiumId) return; // stadiumId가 없을 경우 API 호출 방지

        // ✅ 백엔드 API 요청에 stadiumId와 zoneName을 함께 전달
        axios
            .get(`/api/seats?stadiumId=${stadiumId}&zone=${zoneName}`)
            .then((res) => {
                const reserved = res.data
                    .filter((seat) => !seat.isActive)
                    .map((seat) => seat.number);
                setReservedSeats(reserved);
            })
            .catch((err) => console.error(err));
    }, [stadiumId, zoneName]); // ✅ stadiumId와 zoneName이 변경될 때마다 재호출

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleReserve = async () => {
        try {
            const token = localStorage.getItem("token"); // ✅ localStorage에서 토큰 가져옴
            if (!token) {
                setError("로그인이 필요합니다.");
                return;
            }

            const response = await axios.post(
                "/api/reservations",
                {
                    gameId: parseInt(gameId),
                    seatNumbers: selectedSeats,
                    stadiumId: parseInt(stadiumId), // ✅ 요청 본문에 stadiumId 추가
                    zoneName: zoneName, // ✅ 요청 본문에 zoneName 추가
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // ✅ 요청 헤더에 토큰 추가
                    },
                }
            );

            const reservationId = response.data.reservationId;
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
                <h2 className={styles.title}>좌석 선택 ({zoneName} 구역)</h2>
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