// src/services/courseAPI.js
import instance from "./axiosInstance";
import axios from "axios";

// 🔧 Create a public axios instance without auth interceptors for public endpoints
const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5230/";
const publicInstance = axios.create({
  baseURL: baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL,
  withCredentials: false, // Không gửi cookies cho public requests
});

console.log(
  "🌐 Public instance created with baseURL:",
  publicInstance.defaults.baseURL
);

export const courseAPI = {
  /**
   * 📌 GET /api/Course
   * Lấy danh sách khóa học có phân trang + bộ lọc
   * Query mặc định: page=1, pageSize=10
   * ⚠️ FALLBACK: Thử với instance có auth, nếu fail thử với public instance
   */
  async getCourses({
    page = 1,
    pageSize = 10,
    Q = null,
    CategoryId = null,
    SellerId = null,
    MinPrice = null,
    MaxPrice = null,
    SortBy = null, // price_asc, price_desc, rating_desc, popular
    Level = null,
    IncludeUnApproved = false,
  } = {}) {
    const params = {
      page,
      pageSize,
      Q,
      CategoryId,
      SellerId,
      MinPrice,
      MaxPrice,
      SortBy,
      Level,
      IncludeUnApproved,
    };

    // ❗ Loại bỏ params null để API sạch
    Object.keys(params).forEach(
      (key) => params[key] === null && delete params[key]
    );

    try {
      // Thử với instance có auth trước (cho logged-in users)
      console.log("📡 Fetching courses with auth instance", { params });
      const res = await instance.get("/api/Course", { params });
      console.log("✅ Courses fetched successfully", {
        count: res.data?.items?.length,
      });
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching courses:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        hasToken:
          !!localStorage.getItem("accessToken") ||
          !!localStorage.getItem("token"),
      });

      // Nếu 401 và chưa có token, thử với public instance
      const hasToken =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (error.response?.status === 401 && !hasToken) {
        console.log("🔓 Trying public API call for /api/Course");
        try {
          const res = await publicInstance.get("/api/Course", { params });
          console.log("✅ Public API call successful");
          return res.data;
        } catch (publicError) {
          console.error("❌ Public API call also failed:", publicError);
          throw publicError;
        }
      }
      throw error;
    }
  },
};
