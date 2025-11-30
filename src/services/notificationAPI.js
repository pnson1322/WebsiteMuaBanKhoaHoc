import instance from "./axiosInstance";

export const notificationAPI = {
  // GET /notification: Lấy danh sách thông báo của seller hiện tại.
  getNotification: async () => {
    const res = await instance.get("/notification");
    return res.data;
  },

  // GET /notification/unread-count: Lấy số lượng thông báo chưa đọc của seller.
  getUnreadCount: async () => {
    const res = await instance.get("/notification/unread-count");
    return res.data;
  },

  // POST /notification: Tạo mới một thông báo (dành cho hệ thống hoặc admin gửi đến seller).
  createNotification: async (message, sellerId) => {
    const payload = { message, sellerId };
    const res = await instance.post("/notification", payload);
    return res.data;
  },

  // PUT /notification/mark-as-read/{notificationId}: Đánh dấu một thông báo là đã đọc
  markAsRead: async (notificationId) => {
    if (!notificationId) throw new Error("Missing ID");
    const res = await instance.put(
      `/notification/mark-as-read/${notificationId}`
    );
    return res.data;
  },

  // PUT /notification/mark-all-as-read: Đánh dấu tất cả là đã đọc
  markAllAsRead: async () => {
    const res = await instance.put("/notification/mark-all-as-read");
    return res.data;
  },

  // DELETE /notification/{notificationId}?sellerId={sellerId}: Xóa một thông báo cụ thể
  deleteNotification: async (notificationId, sellerId) => {
    if (!notificationId || !sellerId) throw new Error("Missing ID or SellerID");
    const res = await instance.delete(`/notification/${notificationId}`, {
      params: { sellerId },
    });
    return res.data;
  },

  // DELETE /notification/delete-all: Xóa tất cả thông báo
  deleteAllNotifications: async () => {
    const res = await instance.delete("/notification/delete-all");
    return res.data;
  },
};
