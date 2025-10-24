// src/pages/MyTickets.jsx
import React, { useEffect, useState } from "react";
import { ticketApi } from "../api/ticketApi";
import { useNavigate } from "react-router-dom";

export default function MyTickets() {
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const size = 10;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await ticketApi.getMyTickets({ page, size });
      setPageData(data);
    } catch (e) {
      console.error(e);
      alert("예매 내역을 불러오지 못했습니다. 로그인 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const content = pageData?.content ?? [];

  return (
    <div style={{ maxWidth: 900, padding: 16 }}>
      <h3 style={{ marginBottom: 12 }}>예매 내역</h3>

      {loading ? (
        <div style={{ padding: 24 }}>로딩 중…</div>
      ) : content.length === 0 ? (
        <div style={{ padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
          예매 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {content.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tickets/${t.id}`)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                #{t.id} · {t.gameTitle || `${t.homeTeam ?? ""} vs ${t.awayTeam ?? ""}`.trim()}
              </div>
              <div style={{ fontSize: 14, color: "#555", marginTop: 6 }}>
                좌석: {t.seatNo ?? "-"} · 발급일: {t.issuedAt ?? "-"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: t.claimed ? "#059669" : "#d97706",
                  marginTop: 4,
                }}
              >
                {t.claimed ? "클레임 완료" : "미클레임"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          이전
        </button>
        <span style={{ lineHeight: "32px" }}>
          {page + 1} / {(pageData?.totalPages ?? 1)}
        </span>
        <button
          onClick={() => setPage((p) => (pageData?.last ? p : p + 1))}
          disabled={pageData?.last}
        >
          다음
        </button>
      </div>
    </div>
  );
}
