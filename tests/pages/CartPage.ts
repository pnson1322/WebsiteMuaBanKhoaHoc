import { type Locator, type Page, expect } from "@playwright/test";
import { parseCurrency } from "../utils/currency";

export class CartPage {
  readonly page: Page;
  readonly url = "/cart";

  // --- Locators ---
  readonly backButton: Locator;
  readonly clearAllButton: Locator;
  readonly checkoutButton: Locator;
  readonly totalPriceLabel: Locator;
  readonly cartItems: Locator;
  readonly checkoutPopup: Locator;

  // Selector checkbox chung cho toàn bộ list (để dùng cho hàm getAll)
  readonly allCheckboxes: Locator;

  constructor(page: Page) {
    this.page = page;

    this.backButton = page.locator(".back-button");
    this.clearAllButton = page.locator(".clear-cart-btn");
    this.checkoutButton = page.locator(".checkout-btn");

    this.totalPriceLabel = page.locator(".summary-row.total .summary-value");

    this.cartItems = page.locator(".cart-item");

    // Định nghĩa locator chung cho checkbox
    this.allCheckboxes = page.locator(".cart-item-checkbox");

    // Selector popup
    this.checkoutPopup = page.locator(".payment");
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
    return this.getCartItem(index).locator(".cart-item-checkbox");
  }

  /** Lấy giá tiền hiển thị của item và convert sang số */
  async getItemPrice(index: number): Promise<number> {
    const priceText = await this.getCartItem(index)
      .locator(".cart-item-price")
      .innerText();
    return parseCurrency(priceText);
  }

  /** Lấy tên hiển thị của item */
  async getItemTitle(index: number): Promise<string> {
    return await this.getCartItem(index)
      .locator(".cart-item-title")
      .innerText();
  }

  /** Click nút xem chi tiết */
  async clickViewDetails(index: number) {
    await this.getCartItem(index).locator(".view-details-btn").click();
  }

  /** Click nút xóa item */
  async clickRemoveItem(index: number) {
    await this.getCartItem(index).locator(".remove-btn").click();
  }

  /** Lấy tổng tiền đang hiển thị ở footer */
  async getDisplayedTotal(): Promise<number> {
    // [QUAN TRỌNG] Chờ text xuất hiện trước khi lấy
    await expect(this.totalPriceLabel).toBeVisible();
    const totalText = await this.totalPriceLabel.innerText();
    return parseCurrency(totalText);
  }

  // --- CÁC HÀM BỔ SUNG ĐỂ FIX LỖI ---

  /** Lấy danh sách toàn bộ checkbox (để loop uncheck all) */
  async getAllItemCheckboxes(): Promise<Locator[]> {
    // Chờ ít nhất 1 checkbox xuất hiện nếu cart không rỗng
    if ((await this.cartItems.count()) > 0) {
      await expect(this.allCheckboxes.first()).toBeVisible();
    }
    return await this.allCheckboxes.all();
  }

  /** Verify tổng tiền hiển thị khớp với mong đợi */
  async verifyTotalAmount(expectedAmount: number) {
    const actualAmount = await this.getDisplayedTotal();
    console.log(
      `   >> [Check Cart Total] Expected: ${expectedAmount} - Actual: ${actualAmount}`
    );
    expect(actualAmount).toBe(expectedAmount);
  }
}
