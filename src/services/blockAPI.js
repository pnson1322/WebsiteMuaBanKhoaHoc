// src/services/blockAPI.js
import instance from "./axiosInstance";

export const blockAPI = {
    /**
     * 📌 POST /Block
     * Chặn người dùng (Seller chặn Buyer)
     * Body: { userToBlockId: int }
     */
    async blockUser(userToBlockId) {
        // API yêu cầu body là BlockUserRequest
        const res = await instance.post("/Block/", { userToBlockId });
        return res.data;
    },

    /**
     * 📌 DELETE /Block/{userId}
     * Gỡ chặn người dùng
     */
    async unblockUser(userId) {
        const res = await instance.delete(`/Block/${userId}`);
        return res.data;
    },

    /**
     * 📌 GET /Block/check/{userId}
     * Kiểm tra trạng thái chặn (2 chiều: Mình chặn họ hoặc Họ chặn mình)
     * @param {number} userId - ID của người muốn kiểm tra
     */
    async checkBlockStatus(userId) {
        const res = await instance.get(`/Block/check/${userId}`);
        return res.data; // Trả về { targetUserId: ..., isBlocked: true/false }
    },
};