// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Board from "./pages/Board";
import PostDetail from "./pages/PostDetail";
import Write from "./pages/Write";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import LogoBar from "./components/LogoBar";
import NavBar from "./components/NavBar";

// ✅ 홈을 예매 페이지로 사용
import Reservation from "./pages/Reservation";

// ✅ '경기·결과' 페이지로 사용 (기존 GameSchedule 재활용)
import GameSchedule from "./pages/GameSchedule";

import ReservationZone from "./pages/ReservationZone";
import SeatRouter from "./pages/SeatRouter";
import PaymentPage from "./pages/PaymentPage";
import PaymentResult from "./pages/PaymentResult";

/* 라우트 가드 */
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";

/* 마이페이지 */
import MyPage from "./pages/MyPage";
import MyInfo from "./pages/MyInfo";
import EditProfile from "./pages/EditProfile";
import MyTickets from "./pages/MyTickets";

/* 티켓 상세/클레임 */
import TicketPage from "./pages/TicketPage";

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-7xl mx-auto px-4">
        <LogoBar />
        <NavBar />
        <Routes>
          {/* ✅ '/'를 예매(Reservation)로 매핑 */}
          <Route path="/" element={<Reservation />} />

          {/* ✅ 게시판 (상세 먼저, 그다음 목록) */}
          <Route path="/board/:id" element={<PostDetail />} />
          <Route path="/board" element={<Board />} />
          <Route path="/write" element={<Write />} />

          {/* 인증 */}
          <Route path="/login" element={<Login />} />

          {/* ✅ '경기·결과' 경로: /results → GameSchedule 재사용 */}
          <Route path="/results" element={<GameSchedule />} />
          {/* 호환성: 예전 경로 /GameSchedule 접근 시 /results로 리다이렉트 */}
          <Route path="/GameSchedule" element={<Navigate to="/results" replace />} />

          {/* 예매 관련 기존 경로 유지 (직접 접근/깊은 링크 대비) */}
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/reservation/zone" element={<ReservationZone />} />
          <Route path="/reservation/seat" element={<SeatRouter />} />

          {/* 결제 */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/payment/result" element={<PaymentResult />} />

          {/* 관리자 보호 */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />

          {/* 티켓 상세/클레임 (로그인 필요) */}
          <Route
            path="/tickets/:id"
            element={
              <RequireAuth>
                <TicketPage />
              </RequireAuth>
            }
          />

          {/* 마이페이지 (중첩 라우트) */}
          <Route
            path="/mypage"
            element={
              <RequireAuth>
                <MyPage />
              </RequireAuth>
            }
          >
            <Route index element={<MyInfo />} />
            <Route path="edit" element={<EditProfile />} />
            <Route path="tickets" element={<MyTickets />} />
          </Route>

          {/* 필요 시 404 추가 가능 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
