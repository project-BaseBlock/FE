import React from "react";
import "./LogoBar.css";

// 프로젝트 기준 경로: src/assets/Logo.PNG
import logo from "../assets/Logo.PNG";

export default function LogoBar() {
  return (
    <div className="logobar" role="banner">
      <img
        src={logo}
        alt="BaseBlock 로고"
        className="logobar__logo"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
