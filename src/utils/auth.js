// src/utils/auth.js
export function getToken() {
  const t = localStorage.getItem("token");
  if (!t || t === "null" || t === "undefined") return null;
  return t;
}

export function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;

  // exp는 초 단위이므로 ms로 변환
  if (typeof payload.exp === "number") {
    const now = Date.now();
    const expMs = payload.exp * 1000;
    if (now >= expMs) return false; // 만료
  }
  return true;
}

export function getAuthPayload() {
  const token = getToken();
  if (!isTokenValid(token)) return null;
  return parseJwt(token);
}

export function isAuthenticated() {
  return !!getAuthPayload();
}

export function hasAdminRole() {
  const p = getAuthPayload();
  const role = p?.role;
  return role === "ADMIN" || role === "MASTER";
}
