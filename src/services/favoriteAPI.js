// src/services/favoriteAPI.js
import instance from "./axiosInstance";

export const favoriteAPI = {
  /**
   * 🧡 GET /Favorite
   * Lấy danh sách khóa học yêu thích của user hiện tại
   * Header: Bearer token (Buyer)
   */
  async getFavorites() {
    const res = await instance.get("/Favorite");
    return res.data;
  },

  /**
   * ➕ POST /Favorite/{courseId}
   * Thêm khóa học vào danh sách yêu thích
   * Response: 201 Created
   */
  async addFavorite(courseId) {
    const res = await instance.post(`/Favorite/${courseId}`);
    return res.status === 201;
  },

  /**
   * 🗑️ DELETE /Favorite/clear
   * Xóa tất cả khóa học yêu thích của user hiện tại
   * Response: 204 No Content
   */
  async clearFavorites() {
    const res = await instance.delete("/Favorite/clear");
    return res.status === 204;
  },

  /**
   * ❌ DELETE /Favorite/{courseId}
   * Xóa 1 khóa học yêu thích theo courseId
   * Response: { "message": "Course removed from favorites." }
   */
  async removeFavorite(courseId) {
    const res = await instance.delete(`/Favorite/${courseId}`);
    return res.data;
  },
};
