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
      const res = await instance.get("/api/Course/all", { params });
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

  // /api/Course: GET: Lấy top khoá học bán chạy
  async getTopCourse(page = 1, pageSize = 3, SortBy = "popular") {
    const res = await instance.get("/api/Course", {
      params: {
        page: page,
        pageSize: pageSize,
        SortBy: SortBy,
      },
    });

    return res.data;
  },

  /**
   * 📌 GET /api/Course
   * Lấy danh sách khóa học của seller
   * Header: Authorization: Bearer <token>
   * Query: SellerId: int
   */
  async getSellerCourses({
    page = 1,
    pageSize = 10,
    SellerId = null,
    IncludeUnApproved = false,
  } = {}) {
    const params = {
      page,
      pageSize,
      SellerId,
      IncludeUnApproved,
    };

    // Loại bỏ params null
    Object.keys(params).forEach(
      (key) => params[key] === null && delete params[key]
    );

    console.log("📡 Fetching seller courses", { params });
    const res = await instance.get("/api/Course", { params });
    console.log("✅ Seller courses fetched successfully", {
      count: res.data?.items?.length,
    });
    return res.data;
  },

  // /api/Course/{id}: GET: Lấy chi tiết khóa học
  async getCourseById(id) {
    const res = await instance.get(`/api/Course/${id}`);
    return res.data;
  },

  /**
   * 📌 GET /User/my-courses
   * Lấy danh sách khóa học đã mua của người dùng
   * Header: Authorization: Bearer <token>
   * Query:
   * - page=1, pageSize=10
   * - Q=null(string)
   * - CategoryId=null, SellerId=null (int)
   * - MinPrice=null, MaxPrice=null (number-double)
   * - SortBy=null(price_asc, price_desc, rating_desc, popular)
   * - Level=null
   */
  async getPurchasedCourses({
    page = 1,
    pageSize = 10,
    Q = null,
    CategoryId = null,
    SellerId = null,
    MinPrice = null,
    MaxPrice = null,
    SortBy = null,
    Level = null,
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
    };

    // Loại bỏ params null
    Object.keys(params).forEach(
      (key) => params[key] === null && delete params[key]
    );

    console.log("📡 Fetching purchased courses", { params });
    const res = await instance.get("/User/my-courses", { params });
    console.log("✅ Purchased courses fetched successfully", {
      count: res.data?.items?.length,
      totalPages: res.data?.totalPages,
    });
    return res.data;
  },

  /**
   * 📌 GET /api/Course (Admin)
   * Lấy tất cả khóa học trong database bao gồm cả chưa duyệt
   * Query: page=1, pageSize=10, IncludeUnApproved=false, IncludeRestricted=false
   */
  async getAdminCourses({
    page = 1,
    pageSize = 10,
    Q = null,
    CategoryId = null,
    SellerId = null,
    MinPrice = null,
    MaxPrice = null,
    SortBy = null,
    Level = null,
    IncludeUnApproved = false,
    IncludeRestricted = false,
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
      IncludeRestricted,
    };

    // Loại bỏ params null
    Object.keys(params).forEach(
      (key) => params[key] === null && delete params[key]
    );

    const res = await instance.get("/api/Course", { params });
    return res.data;
  },

  /**
   * 📌 PUT /api/Course/{id}/approve
   * Duyệt khóa học
   */
  async approveCourse(courseId) {
    const res = await instance.put(`/api/Course/${courseId}/approve`);
    return res.data;
  },

  /**
   * 📌 PUT /api/Course/{id}/restrict
   * Hạn chế khóa học
   */
  async restrictCourse(courseId) {
    const res = await instance.put(`/api/Course/${courseId}/restrict`);
    return res.data;
  },

  // /api/Course: POST: Tạo khoá học
  async createCourse(payload) {
    console.log(payload);
    const formData = new FormData();

    formData.append("Title", payload.title);
    formData.append("TeacherName", payload.teacherName);
    formData.append("Description", payload.description || "");
    formData.append("Price", payload.price);
    formData.append("Level", payload.level);
    formData.append("DurationHours", payload.durationHours);
    formData.append("CategoryId", payload.categoryId);

    if (payload.image instanceof File) {
      formData.append("Image", payload.image);
    }

    if (payload.courseContents && payload.courseContents.length > 0) {
      payload.courseContents.forEach((item, index) => {
        formData.append(`CourseContents[${index}].Id`, 0);
        formData.append(`CourseContents[${index}].Title`, item.title);
        formData.append(
          `CourseContents[${index}].Description`,
          item.description
        );
      });
    }

    if (payload.courseSkills && payload.courseSkills.length > 0) {
      payload.courseSkills.forEach((item, index) => {
        formData.append(`CourseSkills[${index}].Id`, 0);
        formData.append(`CourseSkills[${index}].Description`, item.description);
      });
    }

    if (payload.targetLearners && payload.targetLearners.length > 0) {
      payload.targetLearners.forEach((item, index) => {
        formData.append(`TargetLearners[${index}].Id`, 0);
        formData.append(
          `TargetLearners[${index}].Description`,
          item.description
        );
      });
    }

    const res = await instance.post("/api/Course", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // /api/course/{id}: PUT: Sửa khóa học
  async updateCourse(id, data) {
    const formData = new FormData();

    formData.append("Title", data.title);
    formData.append("TeacherName", data.teacherName);
    formData.append("Description", data.description);
    formData.append("Price", data.price);
    formData.append("Level", data.level);
    formData.append("DurationHours", data.durationHours);
    formData.append("CategoryId", data.categoryId);
    formData.append("DeleteImage", data.deleteImage);

    if (data.imageFile instanceof File) {
      formData.append("Image", data.imageFile);
    }

    const res = await instance.put(`/api/course/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // /api/course/{id}: DELETE: Xóa khóa học
  async deleteCourse(id) {
    const res = await instance.delete(`/api/course/${id}`);
    return res.data;
  },

  // /api/Course/{courseId}/contents: POST: thêm nội dung khóa học
  async addCourseContent(courseId, { title, description }) {
    const payload = { title, description };
    const res = await instance.post(
      `/api/Course/${courseId}/contents`,
      payload
    );
    return res.data;
  },

  // /api/Course/{courseId}/contents/{contentId}: DELETE: Xóa nội dung khóa học
  async deleteCourseContent(courseId, contentId) {
    const res = await instance.delete(
      `/api/Course/${courseId}/contents/${contentId}`
    );
    return res.data;
  },

  // /api/Course/{courseId}/skills: POST: Thêm kỹ năng đạt được
  async addCourseSkill(courseId, description) {
    const payload = { id: 0, description };
    const res = await instance.post(`/api/Course/${courseId}/skills`, payload);
    return res.data;
  },

  // /api/Course/{courseId}/skills/{skillId}: DELETE: Xóa kỹ năng đạt được
  async deleteCourseSkill(courseId, skillId) {
    const res = await instance.delete(
      `/api/Course/${courseId}/skills/${skillId}`
    );
    return res.data;
  },

  // /api/Course/{courseId}/target-learners: POST: Thêm đối tượng học viên
  async addTargetLearner(courseId, description) {
    const payload = { id: 0, description };
    const res = await instance.post(
      `/api/Course/${courseId}/target-learners`,
      payload
    );
    return res.data;
  },

  // /api/Course/{courseId}/target-learners/{learnerId}: DELETE: Xóa đối tượng học viên
  async deleteTargetLearner(courseId, learnerId) {
    const res = await instance.delete(
      `/api/Course/${courseId}/target-learners/${learnerId}`
    );
    return res.data;
  },

  // /api/Course/student/{courseId}: GET: Lấy danh sách học viên của một khóa học
  async getStudentList(courseId) {
    const res = await instance.get(`/api/Course/student/${courseId}`);
    return res.data;
  },
};
