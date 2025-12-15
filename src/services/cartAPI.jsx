import instance from "./axiosInstance";

export const cartAPI = {
  // /api/Cart: GET: Lấy giỏ hàng hiện tại
  async getCart() {
    const res = await instance.get("/api/Cart");
    return res.data;
  },

  // /api/Cart: DELETE: Làm trống giỏ hàng
  async deleteCart() {
    await instance.delete("/api/Cart");
  },

  // /api/Cart/items: POST: Thêm khóa học vào giỏ hàng
  async createCartItem(courseId) {
    try {
      const res = await instance.post(`/api/Cart/items/${courseId}`);
      return res.data;
    } catch (err) {
      // 🚨 Token sai / hết hạn / chưa login
      if (err.response?.status === 401) {
        return {
          unauthorized: true,
        };
      }
      throw err;
    }
  },

  // /api/Cart/items/{itemId}: DELETE: Xóa khóa học khỏi giỏ hàng
  async deleteCartItem(itemId) {
    await instance.delete(`/api/Cart/items/${itemId}`);
  },
};
