import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

export default function PaymentButton({
  reservationId,
  stadiumId,
  zoneName,
  seatNumbers, // ["g001","g002", ...]
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!reservationId) return alert("reservationId가 없습니다.");
    if (!stadiumId) return alert("stadiumId가 없습니다.");
    if (!zoneName) return alert("zoneName이 없습니다.");
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0)
      return alert("seatNumbers가 비어 있습니다.");

    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      // ✅ v2: 좌석 배열 포함해 서버가 총액 산출
      const { data } = await axios.post(
        "/payments/ready/v2",
        { reservationId, stadiumId, zoneName, seatNumbers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { merchantUid, amount, buyerName, buyerEmail, buyerTel } = data || {};
      if (!merchantUid || !amount) {
        throw new Error("결제 준비 응답이 올바르지 않습니다.");
      }

      const IMP = window.IMP;
      if (!IMP) throw new Error("IMP 스크립트가 로드되지 않았습니다.");
      IMP.init(import.meta.env.VITE_IAMPORT_MERCHANT);

      IMP.request_pay(
        {
          pg: "html5_inicis.INIpayTest", // 테스트 PG 예시
          pay_method: "card",
          name: "BaseBlock 티켓",
          merchant_uid: merchantUid,
          amount,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_tel: buyerTel,
        },
        async (rsp) => {
          if (!rsp?.success) {
            alert(rsp?.error_msg || "결제가 취소되었습니다.");
            setLoading(false);
            return;
          }
          try {
            await axios.post(
              "/payments/verify",
              { impUid: rsp.imp_uid, merchantUid, reservationId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(
              `/payment/result?reservationId=${reservationId}&merchantUid=${merchantUid}&impUid=${rsp.imp_uid}`
            );
          } catch (e) {
            console.error(e);
            alert("결제 검증에 실패했습니다. 관리자에게 문의하세요.");
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "결제 준비 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? "처리 중..." : "결제하기"}
    </button>
  );
}
