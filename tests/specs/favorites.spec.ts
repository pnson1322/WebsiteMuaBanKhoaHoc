import { test, expect } from '@playwright/test';
import { FavoritesPage } from '../pages/FavoritesPage';
import { loginAs } from '../utils/authHelper';
// Import data từ file riêng
import { initialMockFavorites } from '../data/mockFavoritesData';

test.describe('Buyer Favorites Feature (Mock Data)', () => {
    let favoritesPage: FavoritesPage;

    // Biến này đóng vai trò "Database tạm thời" cho chuỗi test
    let currentFavorites: any[] = [];

    // Reset "Database" về trạng thái ban đầu trước khi bắt đầu chuỗi test
    test.beforeAll(() => {
        // [QUAN TRỌNG] Deep Copy để không làm hỏng data gốc
        currentFavorites = JSON.parse(JSON.stringify(initialMockFavorites));
    });

    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'buyer');
        favoritesPage = new FavoritesPage(page);

        // --- MOCK API (Logic giả lập Server) ---

        // 1. GET: Lấy danh sách (GET /Favorite)
        await page.route('**/Favorite', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(currentFavorites)
                });
            } else {
                await route.fallback();
            }
        });

        // 2. DELETE ALL: Xóa tất cả (DELETE /Favorite/clear)
        // Lưu ý: Định nghĩa route này trước hoặc dùng string cụ thể để Playwright ưu tiên
        await page.route('**/Favorite/clear', async route => {
            if (route.request().method() === 'DELETE') {
                currentFavorites = []; // Xóa sạch mảng trong bộ nhớ giả

                // Theo API Spec: Trả về 204 No Content
                await route.fulfill({
                    status: 204
                    // 204 không có body
                });
            } else {
                await route.fallback();
            }
        });

        // 3. DELETE ONE: Xóa 1 item theo ID (DELETE /Favorite/{courseId})
        // Sử dụng Regex để chỉ bắt các URL kết thúc bằng số (ID), tránh bắt nhầm 'clear'
        await page.route(/\/Favorite\/\d+$/, async route => {
            if (route.request().method() === 'DELETE') {
                const url = route.request().url();
                const idToDelete = url.split('/').pop(); // Lấy ID cuối URL

                // Logic xóa khỏi mảng bộ nhớ giả
                currentFavorites = currentFavorites.filter(c => c.courseId.toString() !== idToDelete);

                // Theo API Spec: Trả về message JSON
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ "message": "Course removed from favorites." })
                });
            } else {
                await route.fallback();
            }
        });

        // 4. Mock API Cart (POST /api/Cart/items/{courseId})
        await page.route('**/api/Cart/items/*', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200, // Hoặc 201 tùy backend thực tế, giả lập success
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: "Added to cart" })
                });
            } else {
                await route.fallback();
            }
        });

        // --- END MOCK ---

        await favoritesPage.goto();
    });

    // --- CÁC TEST CASE ---

    test('TC_Fav_01: UI - Hiển thị đúng thông tin Card', async () => {
        // Data gốc có 2 phần tử
        await favoritesPage.verifyCardCount(2);

        // Verify item đầu tiên
        const firstCard = favoritesPage.getCard(0);
        await expect(firstCard.locator('.course-title')).toHaveText(initialMockFavorites[0].title);
    });

    test('TC_Fav_02: Chức năng - Thêm vào giỏ hàng', async () => {
        // Test nút thêm vào giỏ (gọi API /api/Cart/items/...)
        await favoritesPage.addToCart(0);
        await favoritesPage.verifyAddToCartSuccess(0);
    });

    test('TC_Fav_03: Điều hướng - Xem chi tiết', async ({ page }) => {
        const courseId = initialMockFavorites[0].courseId;
        await favoritesPage.clickDetailButton(0);
        await expect(page).toHaveURL(new RegExp(`/course/${courseId}`));
    });

    test('TC_Fav_04: Điều hướng - Quay lại', async ({ page }) => {
        await page.goto('/');
        await favoritesPage.goto();
        await favoritesPage.goBack();
        await expect(page).toHaveURL('/');
    });

    test('TC_Fav_05: Chức năng - Bỏ thích 1 khóa học', async ({ page }) => {
        const initialCount = currentFavorites.length; // Đang là 2

        // Xóa item đầu tiên (ID 13)
        // Hành động này gọi DELETE /Favorite/13 -> Mock trả về message success -> currentFavorites bị filter
        await favoritesPage.removeCourse(0);

        // Reload để gọi lại API GET /Favorite -> Mock trả về currentFavorites mới
        await page.reload();

        // Kiểm tra số lượng giảm còn 1
        await favoritesPage.verifyCardCount(initialCount - 1);

        // Verify item còn lại là item số 2 (ID 14)
        const card = favoritesPage.getCard(0);
        await expect(card.locator('.course-title')).toHaveText(initialMockFavorites[1].title);
    });

    test('TC_Fav_06: Chức năng - Hủy xóa tất cả (Cancel)', async ({ page }) => {
        // Hiện tại currentFavorites đang còn 1 item (do test TC_Fav_05 chạy trước xóa 1)
        // Lưu ý: Do test chạy song song hoặc tuần tự, tốt nhất nên check length thực tế
        const countBefore = currentFavorites.length;

        page.once('dialog', async dialog => {
            await dialog.dismiss(); // Bấm Cancel
        });

        await favoritesPage.clearAll();
        // Không reload hoặc reload thì số lượng vẫn phải giữ nguyên vì API clear chưa được gọi thực sự
        await page.reload();

        await favoritesPage.verifyCardCount(countBefore);
    });

    test('TC_Fav_07: Chức năng - Xóa tất cả (Accept)', async ({ page }) => {
        page.once('dialog', async dialog => {
            await dialog.accept(); // Bấm OK
        });

        // Hành động này gọi DELETE /Favorite/clear -> Mock trả về 204 -> currentFavorites = []
        await favoritesPage.clearAll();

        // Reload để gọi lại API GET -> Route trả về []
        await page.reload();

        await favoritesPage.verifyEmptyState();
    });
});

test.describe('Buyer Access Control', () => {
    test('Admin role should NOT access Buyer categories page', async ({ page }) => {
        await loginAs(page, 'admin');
        const categoryPage = new FavoritesPage(page);
        await categoryPage.goto();

        await expect(categoryPage.accessDeniedMessage).toBeVisible();
        await expect(categoryPage.accessDeniedMessage).toHaveCSS('color', 'rgb(239, 68, 68)');
    });

    test('Seller role should NOT access Buyer categories page', async ({ page }) => {
        await loginAs(page, 'seller');
        const categoryPage = new FavoritesPage(page);
        await categoryPage.goto();

        await expect(categoryPage.accessDeniedMessage).toBeVisible();
        await expect(categoryPage.accessDeniedMessage).toHaveCSS('color', 'rgb(239, 68, 68)');
    });
});