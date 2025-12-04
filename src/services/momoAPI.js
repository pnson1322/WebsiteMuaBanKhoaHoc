import instance from "./axiosInstance";

export const momoAPI = {
  // /Checkout/CreateMomoPayment: POST: Tạo yêu cầu thanh toán MoMo và trả về URL redirect
  async createMomoPayment({ courseIds, amount }) {
    const payload = {
      courseIds: courseIds,
      amount: amount,
    };

    const res = await instance.post("/Checkout/CreateMomoPayment", payload);
    return res.data;
  },

  // /Checkout/MomoNotify: POST: MoMo gọi lại server để thông báo kết quả thanh toán. Server xác thực chữ ký và lưu giao dịch.
  async momoNotify(params) {
    const formData = new FormData();

    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        formData.append(key, params[key]);
      }
    });

    const res = await instance.post("/Checkout/MomoNotify", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  // /Checkout/MomoConfirm: GET: MoMo redirect người dùng sau thanh toán, BE xử lý lại và redirect sang trang FE
  async confirmMomoPayment(query) {
    const res = await instance.get("/Checkout/MomoConfirm", {
      params: query,
    });
    return res.data;
  },
};
