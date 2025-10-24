import axios from "./axiosInstance";

export const ticketApi = {
  // 사용자 본인 티켓 목록 조회 (페이지네이션 추가)
  async getMyTickets({ page = 0, size = 20 } = {}) {
    const token = localStorage.getItem("token");
    const res = await axios.get("/tickets/me", {
      params: { page, size },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Page<TicketResponse>
  },

  // 티켓 단건 조회
  async getTicketById(ticketId) {
    const token = localStorage.getItem("token");
    const res = await axios.get(`/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // TicketResponse
  },

  // 예약ID로 생성된 최신 티켓 조회 (결제 직후 화면용)
  async getTicketByReservationId(reservationId) {
    const token = localStorage.getItem("token");
    const res = await axios.get(`/tickets/by-reservation/${reservationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // TicketResponse
  },

  // 티켓 클레임 (보관지갑 → 사용자 지갑)
  async claimTicket(ticketId) {
    const token = localStorage.getItem("token");
    const res = await axios.post(`/tickets/${ticketId}/claim`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { txHash, tokenId, ... } 예상
  },
};

export const getMyTickets = ticketApi.getMyTickets;
export const getTicketById = ticketApi.getTicketById;
export const getTicketByReservationId = ticketApi.getTicketByReservationId;
export const claimTicket = ticketApi.claimTicket;