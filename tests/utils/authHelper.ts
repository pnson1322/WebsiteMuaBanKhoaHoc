import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
// Import file JSON data
import authData from '../data/authData.json' with { type: 'json' };

type UserRole = 'buyer' | 'admin' | 'seller';
export { UserRole };

/**
 * Hàm hỗ trợ đăng nhập nhanh theo Role
 * @param page - Playwright Page object
 * @param role - 'buyer' | 'admin' | 'seller'
 */
export async function loginAs(page: Page, role: UserRole) {
    // 1. Tìm user trong file JSON dựa theo role
    const user = authData.find((u) => u.role === role);

    // Nếu không tìm thấy trong JSON thì báo lỗi ngay
    if (!user) {
        throw new Error(`❌ Không tìm thấy user nào có role là: "${role}" trong file authData.json`);
    }

    console.log(`🔑 Đang đăng nhập với quyền: ${role} (${user.email})...`);

    // 2. Khởi tạo LoginPage và thực hiện đăng nhập
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.performLogin(user.email, user.password);

    // 3. (Tùy chọn) Verify nhanh là login thành công để test chạy tiếp yên tâm
    // user.expectedResult là text H1 của trang đích (VD: "Chào mừng...")
    if (typeof user.expectedResult === 'string') {
        await loginPage.verifyLoginSuccess(user.expectedResult);
    }
}