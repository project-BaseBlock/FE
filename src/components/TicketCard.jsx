export default function TicketCard({ t }) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      display: "grid",
      gap: 8
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>#{t.ticketId} • {t.home} vs {t.away}</strong>
        <span>{t.status}</span>
      </div>
      <div>경기일시: {t.dateTime?.replace("T", " ") || "-"}</div>
      <div>구장: {t.stadium || "-"}</div>
      <div>좌석: {t.seatNo || "-"}</div>
      {t.txHash && (
        <div>
          트랜잭션: <a href={`https://sepolia.etherscan.io/tx/${t.txHash}`} target="_blank" rel="noreferrer">{t.txHash}</a>
        </div>
      )}
      {t.nftTokenId && <div>NFT 토큰ID: {t.nftTokenId}</div>}
    </div>
  );
}
