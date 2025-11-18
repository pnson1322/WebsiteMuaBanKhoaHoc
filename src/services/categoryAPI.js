// src/services/categoryAPI.js
import instance from "./axiosInstance";

export const categoryAPI = {
  /**
   * 📌 GET /Category
   * Lấy danh sách tất cả danh mục (Admin)
   */
  async getAll() {
    const res = await instance.get("/Category");
    return res.data;
  },

  /**
   * 📌 POST /Category
   * Thêm mới danh mục
   * Body: { "name": "Tên danh mục" }
   */
  async createCategory(name) {
    const res = await instance.post("/Category", { name });
    return res.status === 201; // Created
  },

  /**
   * 📌 PUT /Category
   * Cập nhật danh mục
   * Body: { "id": 1, "name": "Tên mới" }
   */
  async updateCategory(id, name) {
    const res = await instance.put("/Category", { id, name });
    return res.status === 204; // No Content
  },

  /**
   * 📌 DELETE /Category/{id}
   * Xóa danh mục theo ID
   */
  async deleteCategory(id) {
    const res = await instance.delete(`/Category/${id}`);
    return res.status === 204; // No Content
  },
};
