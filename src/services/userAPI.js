// src/services/userAPI.js
import instance from "./axiosInstance";

export const userAPI = {
  /**
   * 📌 GET /User?page=&pageSize=
   * Lấy danh sách tất cả user (Admin only)
   */
  async getUsers(page = 1, pageSize = 10) {
    const res = await instance.get("/User", {
      params: { page, pageSize },
    });
    return res.data;
  },

  /**
   * 📌 GET /User/Detail
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser() {
    const res = await instance.get("/User/Detail");
    return res.data;
  },

  /**
   * 📌 GET /User/{id}
   * Lấy user theo ID (Admin only)
   */
  async getUserById(id) {
    const res = await instance.get(`/User/${id}`);
    return res.data;
  },

  /**
   * 📌 DELETE /User
   * Xóa user (Admin only)
   * Body: { id }
   */
  async deleteUser(id) {
    const res = await instance.delete("/User", {
      data: { id },
    });
    return res.status === 204;
  },

  /**
   * 📌 PUT /User
   * Cập nhật thông tin user hiện tại
   * (support upload avatar)
   */
  async updateCurrentUser({ fullName, email, phoneNumber, avatar }) {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);

    if (avatar instanceof File) {
      formData.append("avatar", avatar);
    }

    const res = await instance.put("/User", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  /**
   * 📌 POST /User/Admin
   * Tạo admin mới (Admin only)
   */
  async createAdmin({ fullName, email, phoneNumber, password }) {
    const res = await instance.post("/User/Admin", {
      fullName,
      email,
      phoneNumber,
      password,
    });
    return res.data;
  },

  /**
   * 📌 PUT /User/ChangePassword
   * Đổi mật khẩu user hiện tại
   */
  async changePassword({ currentPassword, newPassword }) {
    const res = await instance.put("/User/ChangePassword", {
      currentPassword,
      newPassword,
    });
    return res.status === 204;
  },

  // ------------------------------------------------------
  //  📌 Các API MỚI từ bảng bạn gửi
  // ------------------------------------------------------

  /**
   * 📌 GET /User/role/{role}?page=1&pageSize=5
   * Lấy danh sách user theo role (phân trang)
   * role = Buyer | Seller | Admin
   * (Admin only)
   */
  async getUsersByRole(role, page = 1, pageSize = 5) {
    const res = await instance.get(`/User/role/${role}`, {
      params: { page, pageSize },
    });
    return res.data;
  },

  /**
   * 📌 GET /User/statistics
   * Lấy tổng số lượng user theo từng role
   * (Admin only)
   * Response: { totalUsers, roleCounts: { Admin, Instructor, User } }
   * Note: Instructor = Seller, User = Buyer
   */
  async getUserStatistics() {
    const res = await instance.get("/User/statistics");
    return res.data; // { totalUsers, roleCounts: { Admin, Instructor, User } }
  },
};
