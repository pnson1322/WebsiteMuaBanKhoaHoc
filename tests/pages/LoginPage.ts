import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    // Locators
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly welcomeTitle: Locator;
    readonly registerButton: Locator;
    readonly forgotPasswordLink: Locator;

    // Toast
    readonly toastSuccessIcon: Locator;
    readonly toastErrorIcon: Locator;

    // Validation Message (Span dưới input)
    // Locator chung cho tất cả các span lỗi validation
    readonly validationMessage: Locator;

    //popup Forget password
    readonly forgotPasswordHeading: Locator;
    readonly sendOtpButton: Locator;
    readonly forgotPasswordInput: Locator;

    readonly dashboardHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        this.emailInput = page.locator('input[placeholder="Nhập email"]');
        this.passwordInput = page.locator('input[placeholder="Nhập mật khẩu"]');
        this.loginButton = page.locator('button[type="submit"]');
        this.welcomeTitle = page.getByText('Chào mừng trở lại!', { exact: false });

        this.toastSuccessIcon = page.locator('.toast-icon.success-icon');
        this.toastErrorIcon = page.locator('.toast-icon.error-icon');

        this.validationMessage = page.locator('.sc-lgpSej.nEguV');

        this.registerButton = page.getByRole('button', { name: 'Đăng ký ngay' });
        this.forgotPasswordLink = page.getByRole('link', { name: 'Quên mật khẩu?' });

        // Tìm thẻ Heading (h2) có chữ 'Quên mật khẩu'
        this.forgotPasswordHeading = page.getByRole('heading', { name: 'Quên mật khẩu' });

        // Tìm nút 'Gửi OTP' nằm trong popup
        this.sendOtpButton = page.getByRole('button', { name: 'Gửi OTP' });

        // Tìm ô nhập email trong popup
        this.forgotPasswordInput = page.getByPlaceholder('Nhập email của bạn');
        // Tìm thẻ H1 ở trang đích
        this.dashboardHeading = page.locator('h1');
    }

    async goto() {
        await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
        await expect(this.welcomeTitle).toBeVisible();
        return this;
    }

    async performLogin(email: string, pass: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(pass);
        await this.loginButton.click();
        return this;
    }

    // Verify Success
    async verifyLoginSuccess(expectedHeadingText: string) {

        // 1. Kiểm tra Toast Success (nếu có)
        // Nếu hệ thống của bạn login xong chuyển trang quá nhanh, Toast có thể ko kịp bắt
        // Nên dòng này có thể comment lại nếu gây lỗi flaky
        // await expect(this.toastSuccessIcon).toBeVisible();

        // 2. Chờ trang mới load xong (tìm thẻ H1)
        await expect(this.dashboardHeading).toBeVisible();

        // 3. Kiểm tra nội dung H1 có chứa text mong đợi không
        await expect(this.dashboardHeading).toContainText(expectedHeadingText);

        return this;
    }

    // Verify Fail 
    async verifyLoginFail(expectedResult: string | string[], isToastError: boolean = true) {

        // CASE 1: Lỗi hiển thị trên TOAST (như sai pass, không tồn tại user)
        if (isToastError) {
            await expect(this.toastErrorIcon).toBeVisible();
            // Nếu expectedResult là string thì check luôn
            if (typeof expectedResult === 'string') {
                await expect(this.page.getByText(expectedResult)).toBeVisible();
            }
        }

        // CASE 2: Lỗi hiển thị SPAN VALIDATION (như bỏ trống, sai format)
        else {
            if (Array.isArray(expectedResult)) {
                for (const msg of expectedResult) {
                    await expect(this.page.getByText(msg)).toBeVisible();
                }
            }
            // Nếu là String (1 lỗi: TC04, TC05...)
            else {
                await expect(this.page.getByText(expectedResult)).toBeVisible();
            }
        }
        return this;
    }

    async getEmailValidationMessage(): Promise<string> {
        // evaluate() sẽ chạy một hàm JS nhỏ ngay trên browser
        // 'element' ở đây chính là thẻ <input> email
        // Chúng ta return về thuộc tính validationMessage của nó
        return await this.emailInput.evaluate((element) => {
            // Phải ép kiểu về HTMLInputElement để TS không báo lỗi
            return (element as HTMLInputElement).validationMessage;
        });
    }

    // Click nút Đăng ký
    async clickRegister() {
        await this.registerButton.click();
    }

    // Click link Quên mật khẩu
    async clickForgotPassword() {
        await this.forgotPasswordLink.click();
    }

    // Kiểm tra đã chuyển sang trang đăng ký chưa
    async verifyNavigateToRegister() {
        // Kiểm tra URL có chứa '/register'
        await expect(this.page).toHaveURL(/\/register/);
    }

    // Kiểm tra Popup quên mật khẩu đã mở chưa
    async verifyForgotPasswordPopupOpen() {
        // Kiểm tra tiêu đề popup hiện ra
        await expect(this.forgotPasswordHeading).toBeVisible();
        // Kiểm tra nút Gửi OTP hiện ra
        await expect(this.sendOtpButton).toBeVisible();
        // Kiểm tra ô nhập email hiện ra
        await expect(this.forgotPasswordInput).toBeVisible();
    }


}