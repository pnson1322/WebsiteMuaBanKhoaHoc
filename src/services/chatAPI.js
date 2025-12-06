// src/services/chatAPI.js
import instance from "./axiosInstance";

export const chatAPI = {
    // Lấy danh sách conversations của seller
    async getConversations(sellerId, page = 1, pageSize = 20) {
        const res = await instance.get(`/chat/conversations?page=${page}&pageSize=${pageSize}`, {
            params: { page, pageSize },
        });
        return res.data;
    },

    // Lấy messages của một conversation
    async getMessages(conversationId, page = 1, pageSize = 10) {
        const res = await instance.get(`/chat/conversations/${conversationId}/messages`, {
            params: { page, pageSize },
        });
        return res.data;
    },

    // Gửi message KHỚP backend
    async sendMessage(conversationId, content, attachments = []) {
        const res = await instance.post(`/chat/messages`, {
            conversationId,
            content,
        });

        return res.data;
    },



    // Đánh dấu đã đọc
    async markAsRead(conversationId) {
        const res = await instance.put(`/chat/conversations/${conversationId}/mark-read`);
        return res.data;
    },

    // Lấy danh sách khóa học của seller
    async getSellerCourses(sellerId) {
        const res = await instance.get('/api/Course', {
            params: {
                sellerId: sellerId
            }
        });

        return res.data;
    },


    // Lấy conversations theo khóa học
    async getConversationsByCourse(courseId, page = 1, pageSize = 20) {
        const res = await instance.get(`/chat/conversations/course/${courseId}`, {
            params: { page, pageSize },
        });
        return res.data;
    },

    // Upload file/ảnh
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await instance.post('/chat/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    // Lấy thông tin user
    async getUserInfo(userId) {
        const res = await instance.get(`/User/${userId}`);
        return res.data;
    },

    // Lấy số conversation chưa đọc của user
    async getUnreadConversationCount(userId) {
        const res = await instance.get(`/chat/unread/count`, {
            params: { userId }
        });
        return res.data; // { count: 2 }
    },

    async getUnreadConversationOfCourse() {
        const res = await instance.get(`/chat/conversation/unread`);
        return res.data; // { count: 2 }
    },

    async getOrCreateConversation(sellerId, courseId) {
        // Payload khớp với CreateConversationDto của BE
        const res = await instance.post(`/chat/conversations`, {
            sellerId: sellerId,
            courseId: courseId
        });
        return res.data; // Trả về object Conversation
    },

};