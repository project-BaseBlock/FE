// LogoBar.jsx
import React from "react";
import "./LogoBar.css";

// 프로젝트 기준 경로: src/assets/Logo.PNG
import logo from "../assets/Logo.PNG";

// [ADDED] SPA 내 이동을 위해 Link 사용
import { Link } from "react-router-dom";

export default function LogoBar() {
  return (
    <div className="logobar" role="banner">
      {/* [CHANGED] 로고 이미지를 Link로 감싸 홈('/')로 이동 */}
      <Link to="/" aria-label="홈으로 이동">
        <img
          src={logo}
          alt="BaseBlock 로고"
          className="logobar__logo"
          loading="eager"
          decoding="async"
        />
      </Link>

      {/*
        [OPTION] 정말 풀 리로드로 절대 주소로 가고 싶다면 아래로 교체:
        <a href={window.location.origin + "/"} aria-label="홈으로 이동">
          <img ... />
        </a>
      */}
    </div>
  );
}
