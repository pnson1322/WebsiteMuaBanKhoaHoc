import instance from "./axiosInstance";

export const reviewAPI = {
  getReviewByCourseId: async (courseId) => {
    const res = await instance.get(`/Review/Course/${courseId}`);
    return res.data;
  },

  getSellerReviewByCourseId: async (courseId) => {
    const res = await instance.get(`/Review/Seller/Course/${courseId}`);
    return res.data;
  },

  deleteReviewByAdmin: async (reviewId) => {
    const res = await instance.delete(`/Review/${reviewId}`);
    return res.data;
  },

  deleteReviewByBuyer: async (reviewId) => {
    const res = await instance.delete(`/Review/User/${reviewId}`);
    return res.data;
  },

  createReview: async ({ courseId, rating, comment }) => {
    const payload = { courseId, rating, comment };
    const res = await instance.post("/Review", payload);
    return res.data;
  },

  updateReview: async ({ reviewId, rating, comment }) => {
    const payload = {};
    if (rating !== undefined && rating !== null) payload.rating = rating;
    if (comment !== undefined && comment !== null) payload.comment = comment;

    const res = await instance.put(`/Review/${reviewId}`, payload);
    return res.data;
  },
};
