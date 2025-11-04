export default function MyInfo() {
  const token = localStorage.getItem("token");
  let payload = null;
  try {
    if (token) payload = JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("토큰 파싱 실패", e);
  }

  return (
    <div>
      <h3>내 정보</h3>
      {payload ? (
        <ul>
          <li><b>이메일</b>: {payload.email || "-"}</li>
          <li><b>닉네임</b>: {payload.nickname || payload.sub || "-"}</li>
          <li><b>권한</b>: {payload.role || "-"}</li>
          <li><b>지갑주소</b>: {payload.walletAddress || "-"}</li>
        </ul>
      ) : (
        <p>로그인 정보를 불러오지 못했습니다.</p>
      )}
    </div>
  );
}
