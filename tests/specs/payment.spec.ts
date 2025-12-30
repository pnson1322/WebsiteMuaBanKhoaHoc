import { test, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { PaymentPopup } from "../pages/PaymentPopup";
import { PaymentResultPage } from "../pages/PaymentResultPage"; // Nhớ import cái này
import { loginAs } from "../utils/authHelper";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const mockCartData = require("../data/mockCart.json");

test.describe("Payment Feature - Full Coverage", () => {
  let cartPage: CartPage;
  let paymentPopup: PaymentPopup;
  let resultPage: PaymentResultPage;

  test.beforeEach(async ({ page }) => {
    await page.route(/.*\/api\/Cart$/, async (route) => {
      await route.fulfill({ json: mockCartData });
    });

    await page.route("**/Checkout/CreateMomoPayment", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          payUrl:
            "https://test-payment.momo.vn/v2/gateway/pay?token=mock-token",
        }),
      });
    });

    await loginAs(page, "buyer");
    cartPage = new CartPage(page);
    paymentPopup = new PaymentPopup(page);
    resultPage = new PaymentResultPage(page);
    await cartPage.goto();
  });

  test("E2E_01: Happy Path - Payment Success via MoMo", async ({ page }) => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();

    const navigationPromise = page.waitForURL((url) =>
      url.toString().includes("momo.vn")
    );
    await paymentPopup.clickPayNow();
    await navigationPromise;

    await page.goto(
      "/payment-result?partnerCode=MOMO&orderId=ORDER_123&requestId=REQ_123&amount=500000&orderInfo=PayCourse&orderType=momo_wallet&transId=123456&resultCode=0&message=Success"
    );

    await resultPage.expectSuccess();
    await resultPage.clickGoHome();
  });

  test("E2E_02: Cancel Path - Payment Failed/Cancelled", async ({ page }) => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();

    const navigationPromise = page.waitForURL((url) =>
      url.toString().includes("momo.vn")
    );
    await paymentPopup.clickPayNow();
    await navigationPromise;

    await page.goto(
      "/payment-result?partnerCode=MOMO&orderId=ORDER_123&requestId=REQ_123&amount=500000&orderInfo=PayCourse&orderType=momo_wallet&transId=123456&resultCode=1006&message=Giao dịch bị từ chối bởi người dùng."
    );

    await resultPage.expectFailure();
    await resultPage.clickBackToCart();
  });

  test("TC_0142: Verify Checkout button is disabled when no item selected", async () => {
    const checkboxes = await cartPage.getAllItemCheckboxes();
    for (const box of checkboxes) {
      await box.uncheck();
    }
    await expect(cartPage.checkoutButton).toBeDisabled();
  });

  test("TC_0146 & TC_0147: Verify Partial Selection & Total Calculation", async () => {
    test.skip(mockCartData.length < 2, "Need at least 2 items");

    const item2 = mockCartData[1];
    await cartPage.getItemCheckbox(0).uncheck();
    await cartPage.getItemCheckbox(1).check();

    await cartPage.verifyTotalAmount(item2.price);
    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();
    await paymentPopup.verifyTotalAmount(item2.price);
    await expect(paymentPopup.courseList).toHaveCount(1);
  });

  test("TC_0148 & TC_0173: Verify Payment Methods & Default Selection", async () => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();

    await paymentPopup.verifyMomoSelected();
    await expect(paymentPopup.payButton).toBeEnabled();
    await expect(paymentPopup.totalAmountLabel).toContainText(/đ|VND|₫/);
  });

  test("TC_0176: Verify Button Loading State when clicked", async () => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();
    await paymentPopup.clickPayNow();

    await expect(paymentPopup.payButton).toBeDisabled();
    await expect(paymentPopup.loaderIcon).toBeVisible();
  });

  test("TC_0179: Verify Close Popup functionality", async () => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();
    await paymentPopup.clickClose();
    await paymentPopup.expectHidden();
    await expect(cartPage.checkoutButton).toBeVisible();
  });
});
