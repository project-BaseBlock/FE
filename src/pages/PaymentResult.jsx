import { useMemo, useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const INITIAL_SECONDS = 10;

export default function PaymentResult() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { reservationId, merchantUid, impUid } = useMemo(() => {
    const p = new URLSearchParams(search);
    return {
      reservationId: p.get("reservationId"),
      merchantUid: p.get("merchantUid"),
      impUid: p.get("impUid"),
    };
  }, [search]);

  const [seconds, setSeconds] = useState(INITIAL_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/"); // 10초 후 홈으로 이동
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">결제가 완료되었습니다.</h1>

      <ul className="space-y-1">
        <li>예약번호: <b>{reservationId}</b></li>
        <li>가맹 거래번호(merchantUid): <b>{merchantUid}</b></li>
        <li>PG 거래번호(impUid): <b>{impUid}</b></li>
      </ul>

      <div className="mt-6 flex gap-4">
        <Link to={`/reservation/${reservationId}`} className="underline">
          예약 상세 보기
        </Link>
        <button
          className="underline"
          onClick={() => navigator.share?.({ url: window.location.href })}
        >
          링크 공유
        </button>
      </div>

      {/* 안내 + 카운트다운 + 즉시이동 */}
      <div className="mt-10 p-4 rounded-lg bg-gray-50 border">
        <p className="text-gray-700">
          홈페이지로 이동합니다… <b>{seconds}</b>초
        </p>
        <div className="mt-3">
          <button
            className="px-3 py-2 border rounded hover:bg-gray-100"
            onClick={() => navigate("/")}
          >
            바로 홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
