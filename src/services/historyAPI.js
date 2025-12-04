import axiosInstance from "./axiosInstance";
import logger from "../utils/logger";

/**
 * API service cho lịch sử xem khóa học
 */
export const historyAPI = {
  /**
   * Lấy danh sách lịch sử xem khóa học
   * @param {number} page - Trang hiện tại (mặc định: 1)
   * @param {number} pageSize - Số lượng items mỗi trang (mặc định: 10)
   * @returns {Promise} - Danh sách lịch sử xem
   */
  getHistory: async (page = 1, pageSize = 10) => {
    try {
      logger.info("HISTORY_API", "Fetching history", { page, pageSize });

      const response = await axiosInstance.get("/History", {
        params: { page, pageSize },
      });

      logger.info("HISTORY_API", "History fetched successfully", {
        totalCount: response.data.totalCount,
        itemsCount: response.data.items?.length,
      });

      return response.data;
    } catch (error) {
      logger.error("HISTORY_API", "Failed to fetch history", error);
      throw error;
    }
  },

  /**
   * Thêm một khóa học vào lịch sử xem
   * @param {number} courseId - ID của khóa học
   * @returns {Promise} - Kết quả thêm vào lịch sử
   */
  addToHistory: async (courseId) => {
    try {
      logger.info("HISTORY_API", "Adding course to history", { courseId });

      const response = await axiosInstance.post(`/History/${courseId}`);

      logger.info("HISTORY_API", "Course added to history successfully", {
        courseId,
        status: response.status,
      });

      return response.data;
    } catch (error) {
      logger.error("HISTORY_API", "Failed to add course to history", error);
      throw error;
    }
  },

  /**
   * Xóa một khóa học khỏi lịch sử xem
   * @param {number} courseId - ID của khóa học cần xóa
   * @returns {Promise} - Kết quả xóa
   */
  removeFromHistory: async (courseId) => {
    try {
      logger.info("HISTORY_API", "Removing course from history", { courseId });

      const response = await axiosInstance.delete(`/History/${courseId}`);

      logger.info("HISTORY_API", "Course removed from history successfully", {
        courseId,
        status: response.status,
      });

      return response.data;
    } catch (error) {
      logger.error(
        "HISTORY_API",
        "Failed to remove course from history",
        error
      );
      throw error;
    }
  },

  /**
   * Xóa toàn bộ lịch sử xem
   * @returns {Promise} - Kết quả xóa toàn bộ lịch sử
   */
  clearHistory: async () => {
    try {
      logger.info("HISTORY_API", "Clearing all history");

      const response = await axiosInstance.delete("/History/clear");

      logger.info("HISTORY_API", "All history cleared successfully", {
        status: response.status,
      });

      return response.data;
    } catch (error) {
      logger.error("HISTORY_API", "Failed to clear history", error);
      throw error;
    }
  },
};

export default historyAPI;
