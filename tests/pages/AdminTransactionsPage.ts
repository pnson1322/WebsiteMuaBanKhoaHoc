// tests/pages/AdminTransactionsPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class AdminTransactionsPage {
    readonly page: Page;
    readonly url = '/transactions';

    // Tabs
    readonly tabCourse: Locator;
    readonly tabStudent: Locator;

    // Filters
    readonly filterLabel: Locator;
    readonly searchInput: Locator;
    readonly dateFromInput: Locator;
    readonly dateToInput: Locator;

    // Table
    readonly tableRows: Locator;

    // Detail Button
    readonly btnViewDetail: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tabCourse = page.locator('button.tx-tab', { hasText: 'Theo Khóa Học' });
        this.tabStudent = page.locator('button.tx-tab', { hasText: 'Theo Học Viên' });
        this.filterLabel = page.locator('.tx-filter-label').first();
        this.searchInput = page.locator('.tx-input input');

        // Vì có 2 ô date input cạnh nhau, ta dùng nth hoặc first/last
        this.dateFromInput = page.locator('input.tx-date').first();
        this.dateToInput = page.locator('input.tx-date').nth(1); // Ô thứ 2

        this.tableRows = page.locator('tbody tr');
        this.btnViewDetail = page.locator('button.tx-open-btn', { hasText: 'Xem chi tiết giao dịch' });
    }

    async goto() {
        await this.page.goto(this.url);
    }

    // Actions
    async switchToStudentTab() {
        await this.tabStudent.click();
    }

    async switchToCourseTab() {
        await this.tabCourse.click();
    }

    async search(keyword: string) {
        await this.searchInput.fill(keyword);
        await this.searchInput.press('Enter');
        await this.page.waitForTimeout(500); // Đợi UI render nhẹ
    }

    async filterByDate(fromDate: string, toDate: string) {
        await this.dateFromInput.fill(fromDate);
        await this.dateToInput.fill(toDate);
        // Trigger event change nếu cần
        await this.dateToInput.press('Enter');
    }

    async viewDetail() {
        await this.btnViewDetail.click();
    }

    // Helpers to get row data
    getRowByText(text: string) {
        return this.tableRows.filter({ hasText: text });
    }
}