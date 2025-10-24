// src/pages/PaymentResult.jsx
import React, { useEffect, useState } from "react";
// ★ [ADDED] 결제 직후 예약ID로 티켓 조회 → 상세로 이동
import { ticketApi } from "../api/ticketApi";                // ★ [ADDED]
import { useNavigate, useSearchParams } from "react-router-dom"; // ★ [ADDED]

export default function PaymentResult() {
  // ★ [ADDED] 결제 완료 후 붙여온 reservationId 쿼리 파라미터 사용
  const [searchParams] = useSearchParams();                     // ★ [ADDED]
  const reservationId = searchParams.get("reservationId");      // ★ [ADDED]
  const navigate = useNavigate();                               // ★ [ADDED]

  // 페이지 상태
  const [status, setStatus] = useState("processing"); // processing | verified | no-ticket | error
  const [message, setMessage] = useState("");

  // ★ [ADDED] (선택) 결제 검증 로직: 기존에 네가 쓰던 ready/paid/verify 흐름이 있으면 이 함수 안에서 호출해
  async function verifyPaymentIfNeeded() {
    try {
      // ─────────────────────────────────────────────────────────
      // TODO: 여기에 "네가 이미 쓰는 결제 검증" 호출을 넣으세요.
      // 예) await paymentApi.verify({ impUid, merchantUid })
      // ─────────────────────────────────────────────────────────
      return true; // 검증 성공 가정
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMessage("결제 검증에 실패했습니다.");
      return false;
    }
  }

  // ★ [ADDED] 결제 검증 성공 시 → reservationId 기반 티켓 조회 → 상세로 이동
  async function fetchTicketAndRedirect() {
    try {
      if (!reservationId) {
        setStatus("no-ticket");
        setMessage("예약 ID가 없습니다.");
        return;
      }
      const ticket = await ticketApi.getTicketByReservationId(Number(reservationId));
      if (ticket && ticket.id) {
        // 상세(및 클레임) 페이지로 이동
        navigate(`/tickets/${ticket.id}`, { replace: true });
      } else {
        setStatus("no-ticket");
        setMessage("티켓을 찾지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMessage("티켓 조회 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    (async () => {
      // 1) (옵션) 결제 검증
      const ok = await verifyPaymentIfNeeded();   // ★ [ADDED]
      if (!ok) return;

      setStatus("verified");                      // ★ [ADDED]

      // 2) 예약ID로 티켓 조회 → 상세로 이동
      await fetchTicketAndRedirect();             // ★ [ADDED]
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId]); // ★ [ADDED]

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>결제 결과</h1>

      {status === "processing" && (
        <p>결제를 확인하고 있습니다… 잠시만 기다려 주세요.</p>
      )}

      {status === "verified" && (
        <p>티켓을 불러오고 있습니다…</p>
      )}

      {status === "no-ticket" && (
        <div>
          <p>{message || "결제는 완료되었지만 티켓을 찾지 못했습니다."}</p>
          <button onClick={() => navigate("/mypage/tickets")}>예매 내역 보기</button>
        </div>
      )}

      {status === "error" && (
        <div>
          <p>{message || "처리 중 오류가 발생했습니다."}</p>
          <button onClick={() => navigate("/mypage/tickets")}>예매 내역 보기</button>
        </div>
      )}
    </div>
  );
}
