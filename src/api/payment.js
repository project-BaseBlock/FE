import { api } from "./client";

export async function readyPayment(reservationId) {
  // 백엔드가 /ready?reservationId=... 지원
  return (await api.post(`/payments/ready?reservationId=${reservationId}`)).data;
  // 또는 /ready/{id} 라우트면:
  // return (await api.post(`/payments/ready/${reservationId}`)).data;
}

export async function verifyPayment(params) {
  return (await api.post(`/payments/verify`, params)).data;
}

export async function refundPayment(merchantUid, reason) {
  return (await api.post(`/payments/refund`, { merchantUid, reason })).data;
}
