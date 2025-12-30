import { type Page, type Locator, expect } from "@playwright/test";

export class PaymentResultPage {
  readonly page: Page;
  readonly statusTitle: Locator;
  readonly statusMessage: Locator;
  readonly orderId: Locator;
  readonly homeButton: Locator; // Nút "Vào học ngay"
  readonly backToCartButton: Locator; // Nút "Quay lại giỏ hàng"
  readonly backToHomeButton: Locator; // Nút "Về trang chủ"

  constructor(page: Page) {
    this.page = page;
    // Dựa trên class trong PaymentResult.jsx
    this.statusTitle = page.locator(".payment-result-status-title");
    this.statusMessage = page.locator(".payment-result-status-message");
    this.orderId = page
      .locator(".payment-result-detail-row >> text=Mã đơn hàng")
      .locator("xpath=following-sibling::strong");

    // Nút Primary thay đổi text tùy trạng thái
    this.homeButton = page.locator("button.payment-result-btn-primary", {
      hasText: "Vào học ngay",
    });
    this.backToCartButton = page.locator("button.payment-result-btn-primary", {
      hasText: "Quay lại giỏ hàng",
    });

    this.backToHomeButton = page.locator(
      "button.payment-result-btn-secondary",
      { hasText: "Về trang chủ" }
    );
  }

  async expectSuccess() {
    await expect(this.statusTitle).toHaveText("Thanh toán thành công!", {
      ignoreCase: true,
    });
    await expect(this.homeButton).toBeVisible();
    await expect(this.page).toHaveURL(/.*\/payment-result.*resultCode=0/);
    console.log("✅ Verified Payment Success Screen");
  }

  async expectFailure() {
    // Tiêu đề có thể là "Thanh toán thất bại"
    await expect(this.statusTitle).toContainText("thất bại", {
      ignoreCase: true,
    });
    await expect(this.backToCartButton).toBeVisible();
    console.log("✅ Verified Payment Failure Screen");
  }

  async clickGoHome() {
    await this.homeButton.click();
  }

  async clickBackToCart() {
    await this.backToCartButton.click();
  }
}
