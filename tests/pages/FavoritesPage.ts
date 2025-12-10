import { Page, Locator, expect } from '@playwright/test';

export class FavoritesPage {
    readonly page: Page;

    // --- Page Elements ---
    readonly clearAllButton: Locator;
    readonly backButton: Locator;
    readonly pageHeading: Locator;
    readonly emptyMessage: Locator; // Thông báo khi list trống

    // --- Course Card Elements ---
    readonly courseCards: Locator;
    // Toast
    readonly toastSuccessIcon: Locator;
    readonly toastErrorIcon: Locator;

    constructor(page: Page) {
        this.page = page;

        // Locators cố định
        this.clearAllButton = page.locator('.clear-favorites-btn');
        this.backButton = page.locator('.back-button');

        // Tiêu đề trang (Giả định là thẻ H1 hoặc text to nhất)
        this.pageHeading = page.getByText('Khóa học yêu thích', { exact: false });

        // Locators danh sách Card
        this.courseCards = page.locator('.course-card');

        // Thông báo trống (Check text xuất hiện khi không còn card nào)
        // Bạn cần thay text này nếu web của bạn hiển thị khác (VD: "Bạn chưa có khóa học nào")
        this.emptyMessage = page.getByText('Chưa có khóa học yêu thích', { exact: false });

        this.toastSuccessIcon = page.locator('.toast-icon.success-icon');
        this.toastErrorIcon = page.locator('.toast-icon.error-icon');
    }

    // --- ACTIONS ---

    // 1. Vào trang Favorites
    async goto() {
        // Thay '/favorites' bằng đường dẫn thật của bạn (VD: /user/wishlist)
        await this.page.goto('/favorites', { waitUntil: 'domcontentloaded' });
    }

    // 2. Lấy Card tại vị trí index
    getCard(index: number = 0) {
        return this.courseCards.nth(index);
    }

    // 3. Click nút "Thêm vào giỏ"
    async addToCart(index: number = 0) {
        const card = this.getCard(index);
        await card.locator('.add-to-cart-btn').click();
        await expect(this.toastSuccessIcon).toBeVisible();
    }

    // 4. Click nút "Xem chi tiết" (Con mắt)
    async clickDetailButton(index: number = 0) {
        const card = this.getCard(index);
        await card.locator('.view-details-btn').click();
    }

    // 5. Click vào Title hoặc Ảnh của Card (Để vào chi tiết)
    async clickCardTitle(index: number = 0) {
        const card = this.getCard(index);
        // Click vào title cho chắc ăn (tránh bấm nhầm nút)
        await card.locator('.course-title').click();
    }

    // 6. Click nút Tim (Bỏ yêu thích)
    async removeCourse(index: number = 0) {
        const card = this.getCard(index);
        // class .favorite là class định danh cho nút tim
        await card.locator('.favorite-button.favorite').click();
    }

    // 7. Click nút Xóa tất cả
    async clearAll() {
        // Nếu có popup confirm thì thêm bước handle dialog ở đây
        await this.clearAllButton.click();
    }

    // 8. Click Quay lại
    async goBack() {
        await this.backButton.click();
    }

    // --- VERIFY ---

    // Kiểm tra đã thêm vào giỏ thành công (Nút đổi text)
    async verifyAddToCartSuccess(index: number = 0) {
        const card = this.getCard(index);
        const btn = card.locator('.add-to-cart-btn');
        // Kiểm tra text đổi thành "Đã thêm" hoặc check class thay đổi
        await expect(btn).toContainText('Đã thêm');
    }

    // Kiểm tra số lượng card còn lại
    async verifyCardCount(expectedCount: number) {
        await expect(this.courseCards).toHaveCount(expectedCount);
    }

    // Kiểm tra danh sách đã sạch trơn
    async verifyEmptyState() {
        await expect(this.courseCards).toHaveCount(0);
        // await expect(this.emptyMessage).toBeVisible(); // Bật lên nếu web có hiện thông báo
    }
}