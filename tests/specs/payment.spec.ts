import { test, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { PaymentPopup } from "../pages/PaymentPopup";
import { loginAs } from "../utils/authHelper";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const mockCartData = require("../data/mockCart.json");

test.describe("Payment Popup Feature (Full Coverage)", () => {
  let cartPage: CartPage;
  let paymentPopup: PaymentPopup;

  test.beforeEach(async ({ page }) => {
    await page.route(/.*\/api\/Cart$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCartData),
        });
      } else {
        await route.continue();
      }
    });

    await page.route("**/Checkout/CreateMomoPayment", async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          payUrl: "https://test-payment.momo.vn/success",
        }),
      });
    });

    await loginAs(page, "buyer");
    cartPage = new CartPage(page);
    paymentPopup = new PaymentPopup(page);
    await cartPage.goto();
  });

  // --- CASE 1: THANH TOÁN 1 KHÓA ---
  test("TC01: Verify Payment with SINGLE course", async () => {
    const item = mockCartData[0];

    console.log(`Testing with item: ${item.title} - Price: ${item.price}`);

    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();

    await paymentPopup.expectVisible();

    await paymentPopup.verifyTotalAmount(item.price);
    await paymentPopup.verifyCourseList([item]);
  });

  // --- CASE 2: THANH TOÁN NHIỀU KHÓA ---
  test("TC02: Verify Payment with MULTIPLE courses", async () => {
    const items = mockCartData.slice(0, 2);
    const expectedTotal = items.reduce((sum: any, i: any) => sum + i.price, 0);

    console.log(`Testing with 2 items. Expected Total: ${expectedTotal}`);

    await cartPage.getItemCheckbox(0).check();
    await cartPage.getItemCheckbox(1).check();

    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();

    await paymentPopup.verifyTotalAmount(expectedTotal);
    await paymentPopup.verifyCourseList(items);
  });

  // --- CASE 3: SO KHỚP GIÁ CART VÀ POPUP ---
  test("TC03: Ensure Cart Total matches Popup Total", async () => {
    await cartPage.getItemCheckbox(1).check();

    const cartTotal = await cartPage.getDisplayedTotal();
    console.log(`Total on Cart Screen: ${cartTotal}`);

    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();

    await paymentPopup.verifyTotalAmount(cartTotal);
  });

  // --- CASE 4: CHỨC NĂNG ĐÓNG POPUP ---
  test("TC04: Verify Close Popup functionality", async () => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();

    await paymentPopup.clickClose();

    await paymentPopup.expectHidden();

    await expect(cartPage.checkoutButton).toBeVisible();
  });

  // --- CASE 5: UI LOADING STATE ---
  test("TC05: Verify Loading State (Button Disabled & Spinner)", async () => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();
    await paymentPopup.expectVisible();

    await paymentPopup.payButton.click();

    await expect(paymentPopup.payButton).toBeDisabled();
    await expect(paymentPopup.loaderIcon).toBeVisible();

    console.log("✅ UI showed Loading state correctly");
  });

  // --- CASE 6: REDIRECT HAPPY PATH ---
  test("TC06: Verify Redirect to MoMo Gateway", async ({ page }) => {
    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();

    const redirectPromise = page.waitForURL((url) =>
      url.toString().includes("test-payment.momo.vn")
    );

    await paymentPopup.clickPayNow();
    await redirectPromise;

    console.log("✅ Redirected to MoMo successfully");
  });

  // --- CASE 7: XỬ LÝ LỖI API (EDGE CASE) ---
  test("TC07: Handle API Error (Server 500)", async ({ page }) => {
    await page.route("**/Checkout/CreateMomoPayment", async (route) => {
      console.log("--- Mocking API ERROR 500 ---");
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error from MoMo" }),
      });
    });

    await cartPage.getItemCheckbox(0).check();
    await cartPage.checkoutButton.click();
    await paymentPopup.clickPayNow();

    await expect(paymentPopup.payButton).toBeEnabled();
    await expect(paymentPopup.loaderIcon).toBeHidden();

    expect(page.url()).not.toContain("momo.vn");

    console.log("✅ Handled API Error correctly (No redirect, UI reset)");
  });
});
