// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Board from "./pages/Board";
import PostDetail from "./pages/PostDetail";
import Write from "./pages/Write";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import LogoBar from "./components/LogoBar";
import NavBar from "./components/NavBar";
import GameSchedule from "./pages/GameSchedule";
import Reservation from "./pages/Reservation";
import ReservationZone from "./pages/ReservationZone";
import SeatRouter from "./pages/SeatRouter";
import PaymentPage from "./pages/PaymentPage";
import PaymentResult from "./pages/PaymentResult";

/* 🔻 [ADD] 라우트 가드 */
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";

/* 🔻 [ADD] 마이페이지 관련 */
import MyPage from "./pages/MyPage";
import MyInfo from "./pages/MyInfo";
import EditProfile from "./pages/EditProfile";
import MyTickets from "./pages/MyTickets";

// ★ [ADDED] 티켓 상세/클레임 페이지
import TicketPage from "./pages/TicketPage";

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-7xl mx-auto px-4">
         <LogoBar />
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board" element={<Board />} />
          <Route path="/board/:id" element={<PostDetail />} />
          <Route path="/write" element={<Write />} />
          <Route path="/login" element={<Login />} />
          <Route path="/GameSchedule" element={<GameSchedule />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/reservation/zone" element={<ReservationZone />} />
          <Route path="/reservation/seat" element={<SeatRouter />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/payment/result" element={<PaymentResult />} />

          {/* 🔻 [CHANGE] 관리자 페이지 보호 */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />

          {/* ★ [ADDED] 티켓 상세/클레임 (로그인 필요) */}
          <Route
            path="/tickets/:id"
            element={
              <RequireAuth>
                <TicketPage />
              </RequireAuth>
            }
          />

          {/* 🔻 [ADD] 마이페이지(로그인 필요) + 중첩 라우트 */}
          <Route
            path="/mypage"
            element={
              <RequireAuth>
                <MyPage />
              </RequireAuth>
            }
          >
            <Route index element={<MyInfo />} />            {/* /mypage */}
            <Route path="edit" element={<EditProfile />} /> {/* /mypage/edit */}
            <Route path="tickets" element={<MyTickets />} />{/* /mypage/tickets */}
          </Route>

          {/* 필요시 404 라우트 추가 가능 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
