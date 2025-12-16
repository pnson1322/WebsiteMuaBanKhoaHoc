// pages/AdminUsersPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class AdminUsersPage {
    readonly page: Page;
    readonly url: string = '/admin-users';

    // Selectors - Header & Stats
    readonly searchInput: Locator;
    readonly roleFilterContainer: Locator;
    readonly roleFilterBtn: Locator;

    // Selectors - Table
    readonly tableRows: Locator;

    // Selectors - Modals
    readonly viewModal: Locator;
    readonly deleteModal: Locator;
    readonly modalCloseBtn: Locator;

    constructor(page: Page) {
        this.page = page;

        // Search & Filter
        this.searchInput = page.locator('input[type="search"][placeholder*="Tìm kiếm"]');
        this.roleFilterContainer = page.locator('.role-dropdown');
        this.roleFilterBtn = page.getByRole('button', { name: 'Tất cả vai trò' });

        // Table Rows
        this.tableRows = page.locator('.users-row');

        // Modals
        this.viewModal = page.locator('.users-modal.users-modal--edit');
        this.deleteModal = page.locator('.users-modal:has(h3:has-text("Xác Nhận Xóa"))'); // Giả định class modal delete
        this.modalCloseBtn = page.locator('.users-modal__close');

    }

    async goto() {
        await this.page.goto(this.url);
    }

    /**
     * Lấy số lượng từ thẻ Card thống kê dựa trên Label
     * VD: getStatNumber('Người mua') -> trả về '7' hoặc '6'
     */
    getStatNumberLocator(label: string): Locator {
        // Tìm thẻ cha chứa Label
        const card = this.page.locator('.stat-card', {
            has: this.page.locator('.stat-card__label', { hasText: label })
        });

        // Trả về Locator của con số (chưa lấy text vội)
        return card.locator('.stat-card__number');
    }

    /**
     * Tìm row chứa text cụ thể (Email hoặc Tên)
     */
    getUserRow(text: string): Locator {
        return this.tableRows.filter({ hasText: text });
    }

    async clickActionView(rowText: string) {
        const row = this.getUserRow(rowText);
        await row.locator('.users-action--view').click();
    }

    async clickActionDelete(rowText: string) {
        const row = this.getUserRow(rowText);
        await row.locator('.users-action--delete').click();
    }

    async filterByRole(roleName: string) {
        await this.roleFilterBtn.click();
        // roleName: 'Tất cả vai trò', 'Buyer', 'Seller', 'Admin'
        await this.roleFilterContainer.locator('.role-option', { hasText: roleName }).click();
    }

    async searchUser(keyword: string) {
        await this.searchInput.fill(keyword);
        // Thường search sẽ cần nhấn Enter hoặc đợi debounce, ở đây tôi giả lập đợi 500ms
        await this.page.waitForTimeout(500);
    }

    // Thêm hàm này vào class AdminUsersPage
    getRoleBadgeLocator(roleLabel: string): Locator {
        // Tìm các thẻ span có class role-badge và chứa text tương ứng (không phân biệt hoa thường nếu cần)
        return this.page.locator('.role-badge', { hasText: roleLabel });
    }
}