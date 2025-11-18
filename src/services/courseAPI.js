// src/services/courseAPI.js
import instance from "./axiosInstance";

export const courseAPI = {
  /**
   * Lấy danh sách khóa học (tạm dùng từ Favorite API)
   * Vì endpoint Course riêng backend chưa làm
   */
  async getCourses() {
    const res = await instance.get("/Favorite");

    // Chuẩn hóa dữ liệu giống format bạn cần cho CourseCard
    return (res.data || []).map((item) => ({
      id: item.courseId,
      title: item.title,
      description: item.description,
      teacherName: item.teacherName,
      rating: item.averageRating,
      students: item.totalPurchased,
      duration: item.durationHours,
      price: item.price,
      level: item.level,
    }));
  },

  /**
   * Lấy thông tin chi tiết khóa học theo id
   * (cũng tạm dùng từ Favorite API)
   */
  async getCourseById(courseId) {
    const res = await instance.get("/Favorite");

    const found = (res.data || []).find((c) => c.courseId === Number(courseId));

    if (!found) return null;

    return {
      id: found.courseId,
      title: found.title,
      description: found.description,
      teacherName: found.teacherName,
      rating: found.averageRating,
      students: found.totalPurchased,
      duration: found.durationHours,
      price: found.price,
      level: found.level,
    };
  },
};
