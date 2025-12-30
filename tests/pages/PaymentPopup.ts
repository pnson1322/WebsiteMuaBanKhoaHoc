import { type Locator, type Page, expect } from "@playwright/test";
// Giả định bạn đã có hàm này trong utils (nếu chưa có, mình để code ở dưới)
import { parseCurrency } from "../utils/currency";

export class PaymentPopup {
  readonly page: Page;
  readonly overlay: Locator;
  readonly container: Locator;
  readonly closeButton: Locator;
  readonly courseList: Locator;
  readonly totalAmountLabel: Locator;
  readonly momoMethodOption: Locator;
  readonly payButton: Locator;
  readonly loaderIcon: Locator;

  constructor(page: Page) {
    this.page = page;

    // Cập nhật theo React code: Overlay bao bên ngoài, .payment ở trong
    this.overlay = page.locator(".payment-overlay");
    this.container = this.overlay.locator(".payment");

    // Nút đóng (X icon)
    this.closeButton = this.container.locator(".cancel-icon");

    // Danh sách khóa học trong popup
    this.courseList = this.container.locator(".course-item");

    // Tổng tiền hiển thị
    this.totalAmountLabel = this.container.locator(".price-total");

    // Option MoMo
    this.momoMethodOption = this.container.locator(".method", {
      hasText: "Thanh toán qua Ví MoMo",
    });

    // Nút thanh toán (có class payment-btn)
    this.payButton = this.container.locator("button.payment-btn");

    // Icon loading (svg có class animate-spin)
    this.loaderIcon = this.container.locator(".animate-spin");
  }

  // --- 1. CÁC HÀM VISIBILITY ---

  async expectVisible() {
    await expect(this.overlay).toBeVisible({ timeout: 5000 });
    await expect(this.container).toBeVisible();
  }

  async expectHidden() {
    await expect(this.overlay).toBeHidden();
  }

  async clickClose() {
    await this.closeButton.click();
  }

  // --- 2. CÁC HÀM VERIFY DỮ LIỆU (Logic cũ của bạn) ---

  async verifyTotalAmount(expectedAmount: number) {
    await expect(this.totalAmountLabel).toBeVisible();
    const text = await this.totalAmountLabel.innerText();
    // Helper parseCurrency giúp chuyển "500.000 đ" -> 500000
    const actualAmount = parseCurrency(text);

    console.log(
      `   >> [Check Price Popup] Expected: ${expectedAmount} - Actual UI: ${actualAmount}`
    );
    expect(actualAmount).toBe(expectedAmount);
  }

  async verifyCourseList(expectedCourses: { title: string; price: number }[]) {
    // Chờ list load xong
    await expect(this.courseList).toHaveCount(expectedCourses.length);

    for (let i = 0; i < expectedCourses.length; i++) {
      const itemRow = this.courseList.nth(i);
      const expectedItem = expectedCourses[i];

      // Verify Tên khóa học
      await expect(itemRow.locator(".course-name")).toContainText(
        expectedItem.title
      );

      // Verify Giá tiền
      const priceText = await itemRow.locator(".course-price").innerText();
      expect(parseCurrency(priceText)).toBe(expectedItem.price);
    }
  }

  // --- 3. CÁC HÀM TƯƠNG TÁC THANH TOÁN (Logic mới) ---

  async verifyMomoSelected() {
    // Kiểm tra MoMo được hiển thị và không bị disabled
    await expect(this.momoMethodOption).toBeVisible();
    await expect(this.momoMethodOption).not.toHaveClass(/disabled/);

    // (Optional) Kiểm tra xem có đang được active/border highlight không
    // Tùy CSS của bạn, ví dụ: await expect(this.momoMethodOption).toHaveClass(/active/);
  }

  async clickPayNow() {
    // Đảm bảo nút enable trước khi click
    await expect(this.payButton).toBeEnabled();
    await this.payButton.click();
  }
}
