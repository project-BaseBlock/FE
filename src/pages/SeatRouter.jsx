// src/pages/SeatRouter.jsx
import { useSearchParams } from "react-router-dom";
import OrangeSeatSelector from "./OrangeSeatSelector";
import RedSeatSelector from "./RedSeatSelector";
import BlueSeatSelector from "./BlueSeatSelector";
import NavySeatSelector from "./NavySeatSelector";
import GreenSeatSelector from "./GreenSeatSelector";

export default function SeatRouter() {
  const [searchParams] = useSearchParams();
  const zone = searchParams.get("zone");

  switch (zone) {
  case "orange": return <OrangeSeatSelector />;
  case "red": return <RedSeatSelector />;
  case "blue": return <BlueSeatSelector />;
  case "navy": return <NavySeatSelector />;
  case "green": return <GreenSeatSelector />;
  default: return <div className="text-center p-10 text-lg font-bold">존재하지 않는 구역입니다.</div>;
}
}
