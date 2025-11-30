import instance from "./axiosInstance";

export const dashboardAPI = {
  // GET /dashboard/course/category: Thống kê số lượng khóa học theo danh mục (Admin, Seller)
  getCourseCategoryStats: async () => {
    const res = await instance.get("/dashboard/course/category");
    return res.data;
  },

  // GET /dashboard/monthly/buyer: Thống kê số lượng người mua hàng tháng của Seller
  getMonthlyBuyerStats: async () => {
    const res = await instance.get("/dashboard/monthly/buyer");
    return res.data;
  },

  // GET /dashboard/category/course: Thống kê số lượng khóa học theo danh mục của Seller
  getCourseStatsByCategory: async () => {
    const res = await instance.get("/dashboard/category/course");
    return res.data;
  },

  // GET /dashboard/stats/revenue/fast-12-months: Doanh thu 12 tháng gần nhất của toàn hệ thống (Admin)
  getGlobalRevenueLast12Months: async () => {
    const res = await instance.get("/dashboard/stats/revenue/last-12-months");
    return res.data;
  },

  // GET /dashboard/seller/revenue: Doanh thu 12 tháng gần nhất của Seller
  getSellerRevenue: async (sellerId) => {
    const res = await instance.get("/dashboard/seller/revenue", {
      params: { sellerId },
    });
    return res.data;
  },

  // GET /dashboard/role-count: Thống kê số lượng user theo vai trò (Admin)
  getRoleCountStats: async () => {
    const res = await instance.get("/dashboard/role-count");
    return res.data;
  },

  // GET /dashboard/recent: Danh sách giao dịch gần đây (Admin)
  getRecentTransactions: async () => {
    const res = await instance.get("/dashboard/recent");
    return res.data;
  },

  // GET /dashboard/total-revenue: Tổng doanh thu toàn hệ thống (Admin)
  getGlobalTotalRevenue: async () => {
    const res = await instance.get("/dashboard/total-revenue");
    return res.data;
  },

  // GET /dashboard/seller/total-revenue: Tổng doanh thu của Seller theo khóa học họ bán
  getSellerTotalRevenue: async () => {
    const res = await instance.get("/dashboard/seller/total-revenue");
    return res.data;
  },

  // GET /dashboard/seller/stats: Tổng học viên và rating trung bình của Seller
  getSellerStats: async () => {
    const res = await instance.get("/dashboard/seller/stats");
    return res.data;
  },

  // GET /dashboard/user: Thống kê tổng số người dùng và người dùng mới hôm nay (Admin)
  getUserStats: async () => {
    const res = await instance.get("/dashboard/user");
    return res.data;
  },

  // GET /dashboard/course/{courseId}/monthly-revenue: Doanh thu 12 tháng gần nhất của một khóa học (Seller)
  getCourseMonthlyRevenue: async (courseId) => {
    const res = await instance.get(
      `/dashboard/course/${courseId}/monthly-revenue`
    );
    return res.data;
  },

  // GET /dashboard/course/{courseId}/reviews-stars: Thống kê số lượng đánh giá theo số sao của khóa học (Seller)
  getCourseReviewStars: async (courseId) => {
    const res = await instance.get(
      `/dashboard/courses/${courseId}/review-stars`
    );
    return res.data;
  },

  // GET /dashboard/revenue-7-days: Lấy doanh thu theo ngày trong 7 ngày gần nhất, tính theo CreatedAt. Mỗi ngày trả về tổng TotalAmount.
  getCourse7daysRevenue: async () => {
    const res = await instance.get(`/dashboard/revenue-7-days`);
    return res.data;
  },
};
