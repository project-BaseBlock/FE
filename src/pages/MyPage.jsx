import { /* ★ [CHANGED] */ NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import styles from "../styles/MyPage.module.css";

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 간단한 로그인 가드
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ★ [ADDED] 로그인 후 되돌아오기 위한 리다이렉트 목적지 저장
      sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
      alert("로그인이 필요합니다.");
      navigate("/login", { replace: true });
    }
    // ★ [CHANGED] 위치 바뀔 때마다 토큰 재점검
  }, [navigate, location.pathname, location.search]);

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>마이페이지</h2>
        <nav className={styles.menu}>
          {/* ★ [CHANGED] NavLink로 교체: 활성 상태(class) 자동 부여 */}
          <NavLink
            to="/mypage"
            end
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            내 정보
          </NavLink>

          <NavLink
            to="/mypage/edit"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            정보 수정
          </NavLink>

          <NavLink
            to="/mypage/tickets"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            예매 내역
          </NavLink>
        </nav>
      </aside>

      <main className={styles.content}>
        <Outlet />

        {/* ★ [ADDED] 기본 콘텐츠: 자식 라우트가 없을 때(예: /mypage) 간단 안내 */}
        {location.pathname === "/mypage" && (
          <section style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>내 정보</h3>
            <p style={{ color: "#666", marginBottom: 16 }}>
              좌측 메뉴에서 정보를 수정하거나 예매 내역을 확인할 수 있어요.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <NavLink to="/mypage/edit" className={styles.buttonSecondary}>
                정보 수정으로 이동
              </NavLink>
              <NavLink to="/mypage/tickets" className={styles.buttonPrimary}>
                예매 내역 보기
              </NavLink>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
