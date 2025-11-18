// src/pages/PaymentPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import axios from "../api/axiosInstance";

async function ensurePortOne() {
  if (window.IMP) return window.IMP;
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("PortOne script load failed"));
    document.head.appendChild(s);
  });
  if (!window.IMP) throw new Error("PortOne init failed");
  return window.IMP;
}

export default function PaymentPage() {
  const location = useLocation();
  const [sp] = useSearchParams();
  const { reservationId: ridFromPath } = useParams();

  const reservationId = useMemo(
    () => sp.get("reservationId") || ridFromPath,
    [sp, ridFromPath]
  );

  const [ready, setReady] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  // 로컬에 저장된 메타 정리 함수
  const clearLocalMeta = () => {
    localStorage.removeItem("selectedSeats");
    localStorage.removeItem("selectedStadiumId");
    localStorage.removeItem("selectedZoneName");
  };

  useEffect(() => {
    (async () => {
      if (!reservationId) {
        setStatus("error");
        setMessage("reservationId가 없습니다. /payment?reservationId=123 또는 /payment/123 형태로 접근하세요.");
        return;
      }

      // 1) 값 수집: state → query → localStorage
      const state = location.state || {};

      const seatsQS = sp.get("seats");
      const seatsFromQS = seatsQS
        ? seatsQS.split(",").map((s) => s.trim()).filter(Boolean)
        : null;

      const seatsFromLS = (() => {
        try {
          const raw = localStorage.getItem("selectedSeats");
          const arr = raw ? JSON.parse(raw) : null;
          return Array.isArray(arr) && arr.length > 0 ? arr.map(String) : null;
        } catch {
          return null;
        }
      })();

      const seatNumbers =
        (Array.isArray(state.seatNumbers) && state.seatNumbers.length > 0 && state.seatNumbers.map(String)) ||
        seatsFromQS ||
        seatsFromLS ||
        null;

      const stadiumId =
        (state.stadiumId != null ? Number(state.stadiumId) : null) ||
        (sp.get("stadiumId") ? Number(sp.get("stadiumId")) : null) ||
        (localStorage.getItem("selectedStadiumId") ? Number(localStorage.getItem("selectedStadiumId")) : null);

      const zoneName =
        (state.zoneName != null ? String(state.zoneName) : null) ||
        sp.get("zoneName") ||
        localStorage.getItem("selectedZoneName");

      // 디버그
      console.log("[PaymentPage] meta", { reservationId, stadiumId, zoneName, seatNumbers });

      if (!stadiumId || !zoneName || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        setStatus("error");
        setMessage("결제 메타가 부족합니다. (stadiumId/zoneName/seatNumbers)");
        return;
      }

      // 2) ready/v2 단일 호출
      setStatus("loading");
      setMessage(`v2 호출 중... (stadiumId=${stadiumId}, zoneName=${zoneName}, seats=${seatNumbers.length})`);

      const headers = {};
      const token = localStorage.getItem("accessToken");
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const { data } = await axios.post(
          `/payments/ready/v2`,
          { reservationId: Number(reservationId), stadiumId, zoneName, seatNumbers },
          { headers }
        );
        setReady(data);
        setMessage(`[v2] merchantUid=${data.merchantUid}, amount=${data.amount}`);
        setStatus("ready");
      } catch (e) {
        setStatus("error");
        setMessage(e?.response?.data?.message || e.message || "ready/v2 호출 실패");
      }
    })();
  }, [reservationId, sp, location.state]);

  const handlePay = async () => {
    if (!ready) return;
    try {
      setStatus("paying");
      const IMP = await ensurePortOne();
      const impCode =
        import.meta.env.VITE_IAMPORT_MERCHANT_CODE ||
        import.meta.env.VITE_IAMPORT_MERCHANT ||
        "imp63574472";
      IMP.init(impCode);

      await new Promise((resolve, reject) => {
        IMP.request_pay(
          {
            pg: "html5_inicis",
            pay_method: "card",
            merchant_uid: ready.merchantUid,
            name: "BaseBlock 티켓",
            amount: ready.amount, // 서버 확정 금액
            buyer_email: ready.buyerEmail || "test@example.com",
            buyer_name: ready.buyerName || "테스트사용자",
            buyer_tel: ready.buyerTel || "010-0000-0000",
          },
          async (rsp) => {
            if (!rsp?.success) {
              reject(new Error(rsp?.error_msg || "결제 실패/취소"));
              return;
            }
            setStatus("verifying");
            const payload = { impUid: rsp.imp_uid, merchantUid: rsp.merchant_uid };

            const headers = {};
            const token = localStorage.getItem("accessToken");
            if (token) headers.Authorization = `Bearer ${token}`;

            try {
              const { data } = await axios.post(`/payments/verify`, payload, { headers });
              setMessage(JSON.stringify(data, null, 2));
              setStatus("done");
              // 결제 성공 시 메타 정리
              clearLocalMeta();
              resolve();
            } catch (e) {
              setStatus("error");
              setMessage(e?.response?.data?.message || "VERIFY 호출 실패");
              reject(e);
            }
          }
        );
      });
    } catch (e) {
      setStatus("error");
      setMessage(e?.message || "결제 처리 중 오류");
    }
  };

  const handleVerifyMock = async () => {
    if (!ready) return;
    setStatus("verifying");
    const payload = { impUid: "imp_LOCAL_" + Date.now(), merchantUid: ready.merchantUid };

    const headers = {};
    const token = localStorage.getItem("accessToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const r = await axios.post(`/payments/verify`, payload, { headers });
      setMessage(JSON.stringify(r.data, null, 2));
      setStatus("done");
      // 목 성공 시에도 메타 정리
      clearLocalMeta();
    } catch (e) {
      setStatus("error");
      setMessage(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>결제하기</h1>
      <div style={{ color: "#555" }}>
        reservationId: <b>{reservationId ?? "(없음)"}</b>
      </div>

      <pre style={{ background: "#f7f7f7", padding: 12, whiteSpace: "pre-wrap" }}>
        {message || "대기 중..."}
      </pre>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={handlePay}
          disabled={!ready || status === "paying" || status === "verifying"}
          style={{ padding: "10px 16px", background: "black", color: "white", borderRadius: 8 }}
        >
          {status === "paying" ? "결제창 여는 중..." : status === "verifying" ? "검증 중..." : "결제하기"}
        </button>

        <button
          onClick={handleVerifyMock}
          disabled={!ready || status === "paying" || status === "verifying"}
          style={{ padding: "10px 16px", background: "#444", color: "white", borderRadius: 8 }}
          title="iamport.mock=true일 때 팝업 없이 바로 검증"
        >
          목 모드 검증(imp_LOCAL)
        </button>
      </div>

      {status === "done" && <div style={{ marginTop: 12, color: "#0a7" }}>✅ 결제 플로우 완료</div>}
      {status === "error" && <div style={{ marginTop: 12, color: "#c00" }}>❌ {message}</div>}
    </div>
  );
}
