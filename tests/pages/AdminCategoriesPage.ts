// pages/AdminCategoriesPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class AdminCategoriesPage {
    readonly page: Page;

    // Playwright sẽ tự ghép với baseURL trong file config
    readonly url = '/admin-categories';

    readonly nameInput: Locator;
    readonly addButton: Locator;
    readonly searchInput: Locator;
    readonly categoryRows: Locator;

    readonly editNameInput: Locator;
    readonly updateButton: Locator;
    readonly cancelEditButton: Locator;

    readonly deleteConfirmTitle: Locator;
    readonly confirmDeleteButton: Locator;
    readonly cancelDeleteButton: Locator;

    readonly accessDeniedMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Mapping selectors 
        this.nameInput = page.locator('#category-name');
        this.addButton = page.locator('.cat-primary-btn', { hasText: 'Thêm Danh Mục' });

        this.searchInput = page.locator('.cat-search input[type="search"]');
        this.categoryRows = page.locator('.cat-row');

        this.editNameInput = page.locator('#edit-category-name');
        this.updateButton = page.locator('.cat-btn--primary', { hasText: 'Cập Nhật' });
        this.cancelEditButton = page.locator('.cat-btn--ghost', { hasText: 'Hủy' }).first();

        this.deleteConfirmTitle = page.locator('#delete-category-title');
        this.confirmDeleteButton = page.locator('.cat-btn--danger', { hasText: 'Xóa' });
        this.cancelDeleteButton = page.locator('.cat-btn--ghost', { hasText: 'Hủy' }).last();
        this.accessDeniedMessage = page.locator('h2', { hasText: 'Truy cập bị từ chối' });
    }


    async goto() {
        await this.page.goto(this.url);
    }

    async addCategory(name: string) {
        await this.nameInput.fill(name);
        await this.addButton.click();
        await expect(this.getCategoryRow(name)).toBeVisible();
    }

    async searchCategory(name: string) {
        await this.searchInput.fill(name);
        await this.page.waitForTimeout(500);
    }

    async editCategory(currentName: string, newName: string) {
        const row = this.getCategoryRow(currentName);
        await row.locator(`.cat-action--edit`).click();

        await expect(this.editNameInput).toBeVisible();
        await this.editNameInput.fill(newName);
        await this.updateButton.click();

        await expect(this.editNameInput).toBeHidden();
    }

    async deleteCategory(name: string) {
        const row = this.getCategoryRow(name);

        // Kiểm tra xem nút xóa có tồn tại không trước khi click
        const deleteBtn = row.locator('.cat-action--delete');
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        // Chờ modal và xác nhận xóa
        await expect(this.deleteConfirmTitle).toBeVisible();
        await this.confirmDeleteButton.click();

        await expect(this.deleteConfirmTitle).toBeHidden();
    }

    // --- Helpers ---
    getCategoryRow(name: string): Locator {
        return this.categoryRows.filter({ hasText: name }).first();
    }

    async getFirstCategoryNameText(): Promise<string> {
        // Lấy row đầu tiên
        const firstRow = this.categoryRows.first();
        // Lấy text trong cell name
        const text = await firstRow.locator('.cat-cell--name').innerText();
        return text.trim(); // Loại bỏ khoảng trắng thừa
    }
}