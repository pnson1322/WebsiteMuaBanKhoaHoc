import { type Locator, type Page, expect } from "@playwright/test";
import { parseCurrency } from "../utils/currency";

export class PaymentPopup {
  readonly page: Page;
  readonly container: Locator;
  readonly closeButton: Locator;
  readonly courseList: Locator;
  readonly totalAmountLabel: Locator;
  readonly momoMethodOption: Locator;
  readonly payButton: Locator;
  readonly loaderIcon: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator(".payment");
    this.closeButton = this.container.locator(".cancel-icon");
    this.courseList = this.container.locator(".course-item");
    this.totalAmountLabel = this.container.locator(".price-total");
    this.momoMethodOption = this.container.locator(".method", {
      hasText: "Thanh toán qua Ví MoMo",
    });
    this.payButton = this.container.locator("button.payment-btn");
    this.loaderIcon = this.container.locator(".animate-spin");
    this.toastMessage = page.locator('.toast-message, div[role="alert"]');
  }

  async expectVisible() {
    await expect(this.container).toBeVisible({ timeout: 5000 });
  }

  async expectHidden() {
    await expect(this.container).toBeHidden();
  }

  async clickClose() {
    await this.closeButton.click();
  }

  async verifyTotalAmount(expectedAmount: number) {
    await expect(this.totalAmountLabel).toBeVisible();
    const text = await this.totalAmountLabel.innerText();
    const actualAmount = parseCurrency(text);
    console.log(
      `   >> [Check Price] Expected: ${expectedAmount} - Actual UI: ${actualAmount}`
    );
    expect(actualAmount).toBe(expectedAmount);
  }

  async verifyCourseList(expectedCourses: { title: string; price: number }[]) {
    await expect(this.courseList).toHaveCount(expectedCourses.length);
    for (let i = 0; i < expectedCourses.length; i++) {
      const itemRow = this.courseList.nth(i);
      const expectedItem = expectedCourses[i];
      await expect(itemRow.locator(".course-name")).toContainText(
        expectedItem.title
      );
      const priceText = await itemRow.locator(".course-price").innerText();
      expect(parseCurrency(priceText)).toBe(expectedItem.price);
    }
  }

  async clickPayNow() {
    await expect(this.payButton).toBeEnabled();
    await this.payButton.click();
  }
}
