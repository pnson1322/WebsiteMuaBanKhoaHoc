import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/cartPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';
// Import file mock data
import mockCartData from '../data/mockCart.json' with { type: 'json' };

test.describe('Cart Feature (Buyer Only)', () => {
    let cartPage: CartPage;

    // --- PHẦN 1: TEST CHỨC NĂNG (Dành cho Buyer) ---
    test.describe('Functional Tests', () => {

        // Hook chạy trước mỗi test case
        test.beforeEach(async ({ page }) => {
            // 1. SETUP MOCK API (Phân biệt rõ ràng các API)

            // Mock [DELETE Item Lẻ]: /api/Cart/items/{id}
            // Dùng pattern **/items/* để bắt đúng
            await page.route('**/api/Cart/items/*', async (route) => {
                if (route.request().method() === 'DELETE') {
                    console.log('--- Mocking: Delete Single Item ---');
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ success: true }),
                    });
                } else {
                    await route.fallback();
                }
            });

            // Mock [GET List] & [DELETE All]: /api/Cart
            // Dùng Regex /.*\/api\/Cart$/ để đảm bảo kết thúc bằng Cart, không nhầm với /items
            await page.route(/.*\/api\/Cart$/, async (route) => {
                const method = route.request().method();
                if (method === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(mockCartData),
                    });
                } else if (method === 'DELETE') {
                    console.log('--- Mocking: Clear All Cart ---');
                    await route.fulfill({
                        status: 204
                    });
                } else {
                    await route.continue();
                }
            });

            // 2. Đăng nhập và vào trang
            await loginAs(page, 'buyer');
            cartPage = new CartPage(page);
            await cartPage.goto();
        });

        test('TC01: Should display correct items from Mock Data', async () => {
            await expect(cartPage.cartItems).toHaveCount(mockCartData.length);

            const firstItem = mockCartData[0];
            expect(await cartPage.getItemTitle(0)).toBe(firstItem.title);
            expect(await cartPage.getItemPrice(0)).toBe(firstItem.price);
        });

        test('TC02: Should calculate total price correctly when selecting first 2 items', async () => {
            // 1. Tính tổng tiền mong đợi của 2 item đầu tiên
            // Đảm bảo mock data có ít nhất 2 phần tử
            const firstTwoItems = mockCartData.slice(0, 2);
            const expectedTotal = firstTwoItems.reduce((sum, item) => sum + item.price, 0);

            // 2. Loop tick vào 2 item đầu (index 0 và 1)
            for (let i = 0; i < 2; i++) {
                const checkbox = cartPage.getItemCheckbox(i);

                await checkbox.check();

                // [QUAN TRỌNG] Kiểm tra checkbox đã thực sự được tick 
                // để đảm bảo React đã cập nhật state trước khi tính toán
                await expect(checkbox).toBeChecked();
            }

            // 3. Kiểm tra kết quả hiển thị trên UI
            await expect.poll(async () => {
                const displayedTotal = await cartPage.getDisplayedTotal();

                // Log ra để debug nếu thấy sai số
                console.log(`[Test Debug] Expected: ${expectedTotal} - Actual UI: ${displayedTotal}`);

                return displayedTotal;
            }, {
                timeout: 10000,
                message: `Tổng tiền trên UI không khớp với tổng 2 món đầu (Expected: ${expectedTotal})`
            }).toBe(expectedTotal);
        });

        test('TC03: Should remove single item successfully', async () => {
            // [FIX LỖI RECEIVED 2, EXPECTED -1]
            // Chờ UI render đủ item từ Mock Data trước khi đếm
            await expect(cartPage.cartItems).toHaveCount(mockCartData.length);

            const initialCount = await cartPage.cartItems.count();

            // Xóa item đầu tiên
            await cartPage.clickRemoveItem(0);

            // Kiểm tra giảm 1
            await expect(cartPage.cartItems).toHaveCount(initialCount - 1);
        });

        test('TC04: Should open checkout popup', async () => {
            // Đảm bảo list đã load
            await expect(cartPage.cartItems).toHaveCount(mockCartData.length);

            await cartPage.getItemCheckbox(0).check();
            await cartPage.checkoutButton.click();
            await expect(cartPage.checkoutPopup).toBeVisible();
        });

        test('TC05: Should clear all items successfully', async ({ page }) => {
            // Đảm bảo list đã load
            await expect(cartPage.cartItems).toHaveCount(mockCartData.length);
            page.once('dialog', async (dialog) => {
                expect(dialog.type()).toBe('confirm');  // optional
                await dialog.accept();                  // Nhấn OK
            });


            // Bấm nút xóa tất cả
            await cartPage.clearAllButton.click();

            // Kiểm tra danh sách trống
            await expect(cartPage.cartItems).toHaveCount(0);
        });

        test('TC06: Should navigate back to previous page when clicking "Back" button', async ({ page }) => {
            // 1. Setup: Đi đến trang chủ trước (để tạo lịch sử duyệt web)
            await page.goto('/');

            // 2. Sau đó mới đi vào trang Cart
            await cartPage.goto();

            // Kiểm tra đảm bảo đang ở trang Cart
            await expect(page).toHaveURL(/\/cart/);

            // 3. Hành động: Click nút Back
            await cartPage.backButton.click();

            // 4. Kiểm tra:
            // Cách 1 (Theo ý bạn): URL không còn chứa "/cart" nữa
            await expect(page).not.toHaveURL(/\/cart/);

            // Cách 2 (Chặt chẽ hơn): Kiểm tra nó đã quay về đúng trang chủ ('/')
            await expect(page).toHaveURL((url) => {
                return url.pathname === '/' || url.pathname === ''; // Chấp nhận cả 2 trường hợp root path
            });
        });

        // --- PHẦN 2: TEST PHÂN QUYỀN ---
        test.describe('Access Control', () => {
            const CART_URL = '/cart';
            const unauthorizedRoles: UserRole[] = ['admin', 'seller'];

            for (const role of unauthorizedRoles) {
                test(`Role "${role}" should NOT access cart page`, async ({ page }) => {
                    await verifyAccessDenied(page, role, CART_URL);
                });
            }
        });
    });
});