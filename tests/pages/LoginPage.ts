import { Page, Locator, expect } from '@playwright/test';
let time_limit = 30000; // 30 seconds

export class LoginPage {
    // ... (Giữ nguyên các khai báo Locator và Constructor cũ của bạn) ...
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly welcomeTitle: Locator;
    readonly registerButton: Locator;
    readonly forgotPasswordLink: Locator;
    readonly toastSuccessIcon: Locator;
    readonly toastErrorIcon: Locator;
    readonly validationMessage: Locator;
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
        this.forgotPasswordHeading = page.getByRole('heading', { name: 'Quên mật khẩu' });
        this.sendOtpButton = page.getByRole('button', { name: 'Gửi OTP' });
        this.forgotPasswordInput = page.getByPlaceholder('Nhập email của bạn');
        this.dashboardHeading = page.locator('h1');
    }

    async goto() {
        await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
        await expect(this.welcomeTitle).toBeVisible();
        return this;
    }

    // --- SỬA HÀM NÀY: Đo thời gian Login ---
    async performLogin(email: string, pass: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(pass);

        // Bắt đầu đo ngay trước khi click
        const start = performance.now();

        await this.loginButton.click();

        // Lưu thời gian bắt đầu vào biến global hoặc return về để verify sau
        // Tuy nhiên, cách hay nhất là chờ kết quả ngay tại hàm verify
        // Để đơn giản, ta gán vào thuộc tính của class để dùng sau
        this.lastActionStartTime = start;

        return this;
    }

    // Biến lưu thời gian click
    private lastActionStartTime: number = 0;

    // --- SỬA HÀM VERIFY SUCCESS: Tính toán thời gian phản hồi ---
    async verifyLoginSuccess(expectedHeadingText: string) {
        // Chờ kết quả xuất hiện
        await expect(this.dashboardHeading).toBeVisible();
        await expect(this.dashboardHeading).toContainText(expectedHeadingText);

        // Kết thúc đo
        const end = performance.now();
        this.checkPerformance(end); // Gọi hàm kiểm tra 5s

        return this;
    }

    // --- SỬA HÀM VERIFY FAIL: Tính toán thời gian phản hồi ---
    async verifyLoginFail(expectedResult: string | string[], isToastError: boolean = true) {
        if (isToastError) {
            await expect(this.toastErrorIcon).toBeVisible();
            if (typeof expectedResult === 'string') {
                await expect(this.page.getByText(expectedResult)).toBeVisible();
            }
        } else {
            // Logic check validation message cũ...
            if (Array.isArray(expectedResult)) {
                for (const msg of expectedResult) {
                    await expect(this.page.getByText(msg)).toBeVisible();
                }
            } else {
                await expect(this.page.getByText(expectedResult)).toBeVisible();
            }
        }

        // Kết thúc đo (Lỗi phải hiện ra nhanh)
        const end = performance.now();
        this.checkPerformance(end);

        return this;
    }

    // --- CÁC HÀM CLICK KHÁC CŨNG CẦN ĐO ---

    async clickRegister() {
        this.lastActionStartTime = performance.now(); // Bấm giờ
        await this.registerButton.click();
    }

    async verifyNavigateToRegister() {
        await expect(this.page).toHaveURL(/\/register/);
        const end = performance.now();
        this.checkPerformance(end);
    }

    async clickForgotPassword() {
        this.lastActionStartTime = performance.now(); // Bấm giờ
        await this.forgotPasswordLink.click();
    }

    async verifyForgotPasswordPopupOpen() {
        await expect(this.forgotPasswordHeading).toBeVisible();
        const end = performance.now();
        this.checkPerformance(end);
    }

    // --- HÀM KIỂM TRA CHUNG (Dưới 5s) ---
    private checkPerformance(endTime: number) {
        const duration = endTime - this.lastActionStartTime;
        console.log(`⏱️ Thời gian phản hồi: ${duration.toFixed(2)}ms`);
        expect(duration, `Thời gian phản hồi ${duration.toFixed(2)}ms`).toBeLessThanOrEqual(time_limit);
    }

    // ... (Giữ nguyên getEmailValidationMessage) ...
    async getEmailValidationMessage(): Promise<string> {
        return await this.emailInput.evaluate((element) => {
            return (element as HTMLInputElement).validationMessage;
        });
    }
}