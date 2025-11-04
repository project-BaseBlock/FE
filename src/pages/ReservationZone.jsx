import { useNavigate, useSearchParams } from "react-router-dom";
import stadiumImage from "../assets/stadium.png";

export default function ReservationZone() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId"); // 전달받은 gameId
  const stadiumId = searchParams.get("stadiumId");

  const handleZoneClick = (zone) => {
  navigate(`/reservation/seat?zone=${zone}&gameId=${gameId}&stadiumId=${stadiumId}`);
};
  const zoneBox = "absolute h-[140px] cursor-pointer bg-transparent";
  const textStyle =
    "text-white text-xl font-bold transition-transform duration-200 hover:scale-125";

  // 각 구역 정보 배열 (한글 이름 + 영어 코드 + 위치/회전)
  const zones = [
    {
      name: "레드",
      code: "red",
      style: "top-[410px] left-[95px] w-[100px]",
      rotate: "rotate(35deg)",
      origin: "top right",
      reverse: "-35deg",
    },
    {
      name: "오렌지",
      code: "orange",
      style: "top-[550px] left-[180px] w-[120px]",
      rotate: "rotate(35deg)",
      origin: "top right",
      reverse: "-35deg",
    },
    {
      name: "블루",
      code: "blue",
      style: "top-[550px] left-[450px] w-[100px]",
      rotate: "rotate(-35deg)",
      origin: "top left",
      reverse: "35deg",
    },
    {
      name: "네이비",
      code: "navy",
      style: "top-[415px] left-[540px] w-[120px]",
      rotate: "rotate(-35deg)",
      origin: "top left",
      reverse: "35deg",
    },
  ];

  return (
    <div className="relative w-[768px] h-[768px] mx-auto">
      <img
        src={stadiumImage}
        alt="stadium"
        className="w-full h-full object-cover"
      />

      {/* 반복되는 구역들 (레드~네이비) */}
      {zones.map((zone) => (
        <div
          key={zone.code}
          onClick={() => handleZoneClick(zone.code)}
          className={`${zoneBox} ${zone.style}`}
          style={{
            transform: zone.rotate,
            transformOrigin: zone.origin,
          }}
        >
          <div
            className="flex justify-center items-center w-full h-full"
            style={{ transform: `rotate(${zone.reverse})` }}
          >
            <span className={textStyle}>{zone.name}</span>
          </div>
        </div>
      ))}

      {/* 그린 구역 (별도) */}
      <div
        onClick={() => handleZoneClick("green")}
        className="absolute top-[120px] left-[80px] w-[570px] h-[150px] cursor-pointer bg-transparent flex justify-center items-center"
      >
        <span className={textStyle}>그린</span>
      </div>
    </div>
  );
}
