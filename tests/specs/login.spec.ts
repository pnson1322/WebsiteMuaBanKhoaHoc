import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import authData from '../data/authData.json' with { type: 'json' };

test.describe('EduMart Login & Role Redirect Feature', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    for (const data of authData) {
        test(`${data.id}: ${data.description}`, async () => {
            console.log(`🚀 Testing case: ${data.id} - Role: ${data.role || 'Buyer'}`);

            // 1. Fill inputs & click Login
            // (This method automatically STARTS the timer when clicking)
            await loginPage.performLogin(data.email, data.password);

            // 2. Verification
            // (This method verifies the UI, then STOPS the timer and checks duration < 5s)
            if (data.isSuccess) {
                await loginPage.verifyLoginSuccess(data.expectedResult as string);
            }
            else if (data["isNativeError"]) {
                // For Native browser validation errors, they appear immediately
                // right after click or blur
                // Your existing code verifies using getEmailValidationMessage
                // Measuring display time for native errors is difficult
                // because there is no explicit wait API
                // Usually native errors appear very fast, so timing can be skipped
                // or validated manually if needed

                const actualNativeMsg = await loginPage.getEmailValidationMessage();
                if (actualNativeMsg) {
                    const isMissingAtSymbol = actualNativeMsg.includes('@');
                    const isMissingKeyword =
                        actualNativeMsg.toLowerCase().includes('missing') ||
                        actualNativeMsg.toLowerCase().includes('thiếu');

                    expect(isMissingAtSymbol || isMissingKeyword).toBeTruthy();
                } else {
                    // If native validation is not captured
                    // and UI error is shown instead, this method will measure time
                    await loginPage.verifyLoginFail(data.expectedResult, false);
                }
            }
            else {
                await loginPage.verifyLoginFail(data.expectedResult, data.isToastError);
            }
        });
    }
});

test.describe('Navigation & Popup Verification', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('TC_Nav_01: Clicking "Register now" should navigate to Register page', async () => {
        // This method automatically starts timing when clicking
        await loginPage.clickRegister();

        // This method verifies navigation and checks duration < 5s
        await loginPage.verifyNavigateToRegister();
    });

    test('TC_Nav_02: Clicking "Forgot password?" should open the email input popup', async () => {
        await loginPage.clickForgotPassword();
        await loginPage.verifyForgotPasswordPopupOpen();
    });
});
