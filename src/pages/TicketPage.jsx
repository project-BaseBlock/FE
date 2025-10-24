// src/pages/TicketPage.jsx
import React, { useEffect, useState } from "react";
import { getTicketById, claimTicket } from "../api/ticketApi";
import { useNavigate, useParams } from "react-router-dom";

export default function TicketPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getTicketById(ticketId);
        setT(data);
      } catch (e) {
        console.error(e);
        alert("티켓 정보를 불러오지 못했습니다.");
        navigate("/mypage");
      } finally {
        setLoading(false);
      }
    })();
  }, [ticketId]);

  async function onClaim() {
    if (!window.confirm("이 티켓을 내 지갑으로 클레임할까요?")) return;
    setClaiming(true);
    try {
      const res = await claimTicket(ticketId);
      // 백엔드 응답: txHash/tokenId 등 포함 예상
      alert(`클레임 성공!\nTx: ${res.txHash ?? "-"}\nTokenId: ${res.tokenId ?? "-"}`);
      // 다시 조회해서 최신 상태 반영
      const data = await getTicketById(ticketId);
      setT(data);
    } catch (e) {
      console.error(e);
      alert("클레임에 실패했습니다. 지갑 주소 등록 여부를 확인해주세요.");
    } finally {
      setClaiming(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>로딩중…</div>;
  if (!t) return null;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>티켓 상세 #{t.id}</h1>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {t.gameTitle || `${t.homeTeam ?? ""} vs ${t.awayTeam ?? ""}`.trim()}
        </div>
        <div style={{ color: "#555", fontSize: 14, marginBottom: 4 }}>
          경기일: {t.gameDate ?? "-"} · 좌석: {t.seatNo ?? "-"}
        </div>
        <div style={{ color: t.claimed ? "#059669" : "#d97706", fontSize: 14 }}>
          상태: {t.claimed ? "클레임 완료" : "미클레임"}
        </div>

        {!!t.txHash && (
          <div style={{ marginTop: 8, fontSize: 14 }}>
            txHash: <a href={`https://sepolia.etherscan.io/tx/${t.txHash}`} target="_blank" rel="noreferrer">{t.txHash}</a>
          </div>
        )}
        {!!t.tokenId && (
          <div style={{ fontSize: 14 }}>tokenId: {t.tokenId}</div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {!t.claimed && (
            <button onClick={onClaim} disabled={claiming}>
              {claiming ? "클레임 중..." : "내 지갑으로 클레임"}
            </button>
          )}
          <button onClick={() => navigate("/mypage")}>내 티켓으로</button>
        </div>
      </div>
    </div>
  );
}
