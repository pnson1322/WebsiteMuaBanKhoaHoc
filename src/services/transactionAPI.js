// src/services/transactionAPI.js
import instance from "./axiosInstance";

export const transactionAPI = {
    async getTransactionsByCourses(page = 1, pageSize = 10) {
        const res = await instance.get("/Transactions/stats/courses", {
            params: { page, pageSize },
        });
        return res.data;
    },

    async getTransactionsByStudents(page = 1, pageSize = 10) {
        const res = await instance.get("/Transactions/stats/students", {
            params: { page, pageSize },
        });
        return res.data;
    },

    async getTransactions(page = 1, pageSize = 10) {
        const res = await instance.get("/Transactions", {
            params: { page, pageSize },
        });
        return res.data;
    },

    async getTransactionByCode(transactionCode) {
        const res = await instance.get(`/Transactions/${transactionCode}`);
        return res.data;
    },
};
