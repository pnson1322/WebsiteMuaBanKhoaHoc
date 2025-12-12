import { Page, Locator, expect } from '@playwright/test';

export class FavoritesPage {
    readonly page: Page;

    // --- Page Elements ---
    readonly clearAllButton: Locator;
    readonly backButton: Locator;
    readonly pageHeading: Locator;
    readonly emptyMessage: Locator;

    // --- Course Card Elements ---
    readonly courseCards: Locator;

    // --- Toast Elements ---
    readonly toastSuccessIcon: Locator;
    readonly toastErrorIcon: Locator;

    readonly accessDeniedMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Locators cố định
        this.clearAllButton = page.locator('.clear-favorites-btn');
        this.backButton = page.locator('.back-button');

        // Tiêu đề trang
        this.pageHeading = page.getByText('Khóa học yêu thích', { exact: false });

        // Locators danh sách Card
        this.courseCards = page.locator('.course-card');

        // Thông báo trống
        this.emptyMessage = page.getByText('Chưa có khóa học yêu thích', { exact: false });

        // Toast
        this.toastSuccessIcon = page.locator('.toast-icon.success-icon');
        this.toastErrorIcon = page.locator('.toast-icon.error-icon');
        this.accessDeniedMessage = page.locator('h2', { hasText: 'Truy cập bị từ chối' });
    }

    // --- ACTIONS ---

    // 1. Vào trang Favorites
    async goto() {
        await this.page.goto('/favorites');

        // 🔥 QUAN TRỌNG: Đổi từ 'domcontentloaded' sang 'networkidle'
        // Lý do: Để Playwright đợi API load xong danh sách khóa học rồi mới chạy tiếp.
        // Giúp khắc phục lỗi "Ma trơi" (lúc đầu count=0, sau đó count=2).
        await this.page.waitForLoadState('networkidle');
    }

    // 2. Lấy Card tại vị trí index
    getCard(index: number = 0) {
        return this.courseCards.nth(index);
    }

    // 3. Click nút "Thêm vào giỏ"
    async addToCart(index: number = 0) {
        const card = this.getCard(index);
        const btn = card.locator('.add-to-cart-btn');

        // 1. Kiểm tra trạng thái hiện tại
        // Dùng textContent() thay vì innerText() đôi khi nhanh hơn
        const btnText = await btn.textContent() || "";

        if (btnText.includes('Đã thêm')) {
            console.log('ℹ️ Đã có trong giỏ hàng -> Skip click.');
            return;
        }

        // 2. Click
        await btn.click();

        // 3. VERIFY: Đợi cho nút đổi chữ thành "Đã thêm"
        // Cách này xịn hơn check Toast vì nút "Đã thêm" nó nằm im đó mãi mãi
        await expect(btn).toContainText('Đã thêm');
    }

    // 4. Click nút "Xem chi tiết" (Con mắt)
    async clickDetailButton(index: number = 0) {
        const card = this.getCard(index);
        await card.locator('.view-details-btn').click();
    }

    // 5. Click vào Title hoặc Ảnh của Card
    async clickCardTitle(index: number = 0) {
        const card = this.getCard(index);
        await card.locator('.course-title').click();
    }

    // 6. Click nút Tim (Bỏ yêu thích)
    async removeCourse(index: number = 0) {
        const card = this.getCard(index);

        // Tìm nút tim ĐANG ĐỎ (.favorite)
        const heartBtn = card.locator('.favorite-button.favorite');

        // Đợi nút hiện ra chắc chắn rồi mới bấm (tránh bấm hụt khi UI đang render)
        await expect(heartBtn).toBeVisible();
        await heartBtn.click();
    }

    // 7. Click nút Xóa tất cả
    async clearAll() {
        await this.clearAllButton.click();
    }

    // 8. Click Quay lại
    async goBack() {
        await this.backButton.click();
    }

    // --- VERIFY ---

    // Kiểm tra đã thêm vào giỏ thành công
    async verifyAddToCartSuccess(index: number = 0) {
        const card = this.getCard(index);
        const btn = card.locator('.add-to-cart-btn');

        // Kiểm tra text đổi thành "Đã thêm"
        await expect(btn).toContainText('Đã thêm');
    }

    // Kiểm tra số lượng card còn lại
    async verifyCardCount(expectedCount: number) {
        // Playwright sẽ tự động retry (thử lại) trong 5s cho đến khi số lượng khớp
        await expect(this.courseCards).toHaveCount(expectedCount);
    }

    // Kiểm tra danh sách đã sạch trơn
    async verifyEmptyState() {
        await expect(this.courseCards).toHaveCount(0);
    }
}