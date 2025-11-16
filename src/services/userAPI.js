import instance from "./axiosInstance";

export const userAPI = {
    // Lấy thông tin user hiện tại
    async getUserDetail() {
        const res = await instance.get("/User/Detail");
        return res.data;
    },

    // Cập nhật thông tin user (có thể kèm avatar)
    async updateUser({ fullName, phoneNumber, avatarFile }) {
        const formData = new FormData();

        // Chỉ append các field có giá trị
        if (fullName !== undefined && fullName !== null && fullName !== "") {
            formData.append("fullName", fullName);  // lowercase 'f'
        }
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            formData.append("phoneNumber", phoneNumber);  // lowercase 'p'
        }
        if (avatarFile) {
            formData.append("avatar", avatarFile);  // lowercase 'a'
        }

        // KHÔNG set Content-Type, để axios tự động set với boundary
        const res = await instance.put("/User", formData);
        return res.data;
    },

    // Đổi mật khẩu
    async changePassword({ currentPassword, newPassword }) {
        await instance.put("/User/ChangePassword", {
            currentPassword,
            newPassword,
        });
    },
};