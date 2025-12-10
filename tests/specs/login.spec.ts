import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
// Dùng assert type: json để import file json
import authData from '../data/authData.json' with { type: 'json' };

test.describe('EduMart Login & Role Redirect Feature', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    for (const data of authData) {
        test(`${data.id}: ${data.description}`, async () => {
            console.log(`🚀 Testing case: ${data.id} - Role: ${data.role || 'Buyer'}`);

            // 1. Login
            await loginPage.performLogin(data.email, data.password);

            // 2. Phân loại kết quả
            if (data.isSuccess) {
                // --- NHÁNH 1: LOGIN THÀNH CÔNG (CHECK QUYỀN HẠN) ---
                // data.expectedResult lúc này là Text của H1 ("Quản lý EduMart"...)
                await loginPage.verifyLoginSuccess(data.expectedResult as string);
            }
            // --- NHÁNH 2: LỖI NATIVE ---
            else if (data["isNativeError"]) {
                // ... (Logic cũ giữ nguyên)
                const actualNativeMsg = await loginPage.getEmailValidationMessage();
                if (actualNativeMsg) {
                    const isMissingAtSymbol = actualNativeMsg.includes('@');
                    const isMissingKeyword = actualNativeMsg.toLowerCase().includes('missing') ||
                        actualNativeMsg.toLowerCase().includes('thiếu');
                    expect(isMissingAtSymbol || isMissingKeyword).toBeTruthy();
                } else {
                    await loginPage.verifyLoginFail(data.expectedResult, false);
                }
            }
            // --- NHÁNH 3: LỖI UI ---
            else {
                await loginPage.verifyLoginFail(data.expectedResult, data.isToastError);
            }
        });
    }
});

test.describe('Kiểm tra điều hướng & Popup', () => {
    let loginPage: LoginPage;
    // Vẫn dùng beforeEach để vào trang login trước
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('TC_Nav_01: Nhấn "Đăng ký ngay" phải chuyển sang trang Register', async () => {
        await loginPage.clickRegister();
        await loginPage.verifyNavigateToRegister();
    });

    test('TC_Nav_02: Nhấn "Quên mật khẩu?" phải mở Popup nhập email', async () => {
        await loginPage.clickForgotPassword();
        await loginPage.verifyForgotPasswordPopupOpen();
    });
});