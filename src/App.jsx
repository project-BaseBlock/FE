import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Board from "./pages/Board";
import PostDetail from "./pages/PostDetail";
import Write from "./pages/Write";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NavBar from "./components/NavBar";
import GameSchedule from "./pages/GameSchedule";
import Reservation from "./pages/Reservation";
import ReservationZone from "./pages/ReservationZone";
import SeatRouter from "./pages/SeatRouter";
import PaymentPage from "./pages/PaymentPage";
import PaymentResult from "./pages/PaymentResult";


function App() {
  return (
    <BrowserRouter>
    <div className="max-w-7xl mx-auto px-4">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
        <Route path="/board/:id" element={<PostDetail />} />
        <Route path="/write" element={<Write />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/GameSchedule" element={<GameSchedule />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/reservation/zone" element={<ReservationZone />} />
        <Route path="/reservation/seat" element={<SeatRouter />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/payment/result" element={<PaymentResult />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
