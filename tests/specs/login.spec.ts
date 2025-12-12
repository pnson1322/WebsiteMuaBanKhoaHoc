import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
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

            // 1. Nhập liệu & Click Login (Hàm này sẽ tự BẮT ĐẦU bấm giờ khi click)
            await loginPage.performLogin(data.email, data.password);

            // 2. Verify (Hàm này sẽ verify UI xong -> KẾT THÚC bấm giờ -> Check < 5s)
            if (data.isSuccess) {
                await loginPage.verifyLoginSuccess(data.expectedResult as string);
            }
            else if (data["isNativeError"]) {
                // Với lỗi Native (validation browser), nó hiện tức thì ngay khi click hoặc blur
                // Code cũ của bạn đang verify getEmailValidationMessage
                // Nếu muốn đo thời gian lỗi này hiện ra thì hơi khó vì nó không có API chờ
                // Tuy nhiên, thường native error rất nhanh. Ta có thể bỏ qua đo ở đây hoặc check thủ công.

                const actualNativeMsg = await loginPage.getEmailValidationMessage();
                if (actualNativeMsg) {
                    const isMissingAtSymbol = actualNativeMsg.includes('@');
                    const isMissingKeyword = actualNativeMsg.toLowerCase().includes('missing') ||
                        actualNativeMsg.toLowerCase().includes('thiếu');
                    expect(isMissingAtSymbol || isMissingKeyword).toBeTruthy();
                } else {
                    // Nếu lỗi native không bắt được mà fallback sang lỗi UI thì hàm này sẽ đo giờ
                    await loginPage.verifyLoginFail(data.expectedResult, false);
                }
            }
            else {
                await loginPage.verifyLoginFail(data.expectedResult, data.isToastError);
            }
        });
    }
});

test.describe('Kiểm tra điều hướng & Popup', () => {
    let loginPage: LoginPage;
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('TC_Nav_01: Nhấn "Đăng ký ngay" phải chuyển sang trang Register', async () => {
        // Hàm này tự bấm giờ khi click
        await loginPage.clickRegister();
        // Hàm này verify xong sẽ check thời gian < 5s
        await loginPage.verifyNavigateToRegister();
    });

    test('TC_Nav_02: Nhấn "Quên mật khẩu?" phải mở Popup nhập email', async () => {
        await loginPage.clickForgotPassword();
        await loginPage.verifyForgotPasswordPopupOpen();
    });
});