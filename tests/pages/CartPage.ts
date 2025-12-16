import { type Locator, type Page, expect } from '@playwright/test';
import { parseCurrency } from '../utils/currency';

export class CartPage {
    readonly page: Page;
    readonly url = '/cart';

    // --- Locators ---
    readonly backButton: Locator;
    readonly clearAllButton: Locator;
    readonly checkoutButton: Locator;
    readonly totalPriceLabel: Locator;
    readonly cartItems: Locator;
    readonly checkoutPopup: Locator;

    constructor(page: Page) {
        this.page = page;

        this.backButton = page.locator('.back-button');
        this.clearAllButton = page.locator('.clear-cart-btn');
        this.checkoutButton = page.locator('.checkout-btn');

        this.totalPriceLabel = page.locator('.summary-row.total .summary-value');

        this.cartItems = page.locator('.cart-item');

        // Selector popup (theo snippet mới nhất của bạn)
        this.checkoutPopup = page.locator('.payment');
    }

    async goto() {
        await this.page.goto(this.url);
    }

    /** Lấy element item tại vị trí index */
    getCartItem(index: number) {
        return this.cartItems.nth(index);
    }

    /** Lấy checkbox của item tại index */
    getItemCheckbox(index: number) {
        return this.getCartItem(index).locator('.cart-item-checkbox');
    }

    /** Lấy giá tiền hiển thị của item và convert sang số */
    async getItemPrice(index: number): Promise<number> {
        const priceText = await this.getCartItem(index).locator('.cart-item-price').innerText();
        return parseCurrency(priceText);
    }

    /** Lấy tên hiển thị của item */
    async getItemTitle(index: number): Promise<string> {
        return await this.getCartItem(index).locator('.cart-item-title').innerText();
    }

    /** Click nút xem chi tiết */
    async clickViewDetails(index: number) {
        await this.getCartItem(index).locator('.view-details-btn').click();
    }

    /** Click nút xóa item */
    async clickRemoveItem(index: number) {
        await this.getCartItem(index).locator('.remove-btn').click();
    }

    /** Lấy tổng tiền đang hiển thị ở footer */
    async getDisplayedTotal(): Promise<number> {
        // [QUAN TRỌNG] Chờ text xuất hiện trước khi lấy để tránh lỗi strict mode hoặc lấy text rỗng
        await expect(this.totalPriceLabel).toBeVisible();
        const totalText = await this.totalPriceLabel.innerText();
        return parseCurrency(totalText);
    }
}