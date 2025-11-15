// src/services/favoriteAPI.js
import axios from "axios";

// Base URL được set sẵn ở nơi khác (axios.defaults.baseURL = import.meta.env.VITE_BASE_URL)
// nên ở đây chỉ cần gọi endpoint tương đối.

export const favoriteAPI = {
  /**
   * 🧡 Lấy danh sách khóa học yêu thích của user hiện tại
   * Header: Bearer token (Buyer)
   */
  async getFavorites() {
    const res = await axios.get("/Favorite", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data; // Mảng các khóa học yêu thích
  },

  /**
   * ➕ Thêm khóa học vào danh sách yêu thích
   * @param {number} courseId
   */
  async addFavorite(courseId) {
    const res = await axios.post(`/Favorite/${courseId}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.status === 201; // Trả về true nếu thêm thành công
  },

  /**
   * ❌ Xóa khóa học yêu thích theo courseId
   * @param {number} courseId
   */
  async removeFavorite(courseId) {
    const res = await axios.delete(`/Favorite/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data; // { message: "Course removed from favorites." }
  },

  /**
   * 🗑️ Xóa toàn bộ danh sách yêu thích của user hiện tại
   */
  async clearFavorites() {
    const res = await axios.delete("/Favorite/clear", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.status === 204; // Trả về true nếu xóa thành công
  },
};
