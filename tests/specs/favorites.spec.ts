import { test, expect } from '@playwright/test';
import { FavoritesPage } from '../pages/FavoritesPage';
import { loginAs } from '../utils/authHelper';

test.describe.configure({ mode: 'serial' });

test.describe('Buyer Favorites Feature', () => {
    let favoritesPage: FavoritesPage;

    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'buyer');
        favoritesPage = new FavoritesPage(page);
        await favoritesPage.goto();

        // 🔥 FIX LOGIC AUTO-HEALING: 
        // Đợi 2 giây cho chắc chắn API đã load danh sách về
        // (Dù đã có networkidle nhưng đôi khi server local phản hồi chậm)
        await page.waitForTimeout(2000);

        const count = await favoritesPage.courseCards.count();

        // Chỉ thêm data nếu THỰC SỰ trống
        if (count === 0) {
            console.log('⚠️ Danh sách trống thật sự. Đang đi thêm khóa học...');
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Tìm nút tim chưa like
            const heartBtn = page.locator('.course-card .favorite-button:not(.favorite)').first();

            if (await heartBtn.isVisible()) {
                await heartBtn.click();
                await page.waitForTimeout(500); // Đợi server lưu
                console.log('✅ Đã thêm 1 khóa học.');
            } else {
                console.log('❌ Không tìm thấy khóa học nào để like.');
            }
            await favoritesPage.goto();
            await page.waitForTimeout(1000);
        }
    });

    test('TC_Fav_01: UI - Hiển thị đúng thông tin Card', async () => {
        const card = favoritesPage.getCard(0);
        await expect(card).toBeVisible();
        await expect(card.locator('.course-title')).toBeVisible();
    });

    test('TC_Fav_02: Chức năng - Thêm vào giỏ hàng', async () => {
        await favoritesPage.addToCart(0);
        await favoritesPage.verifyAddToCartSuccess(0);
    });

    test('TC_Fav_03: Điều hướng - Xem chi tiết bằng nút con mắt', async ({ page }) => {
        await favoritesPage.clickDetailButton(0);
        await expect(page).not.toHaveURL(/favorites/);
    });

    test('TC_Fav_04: Điều hướng - Nút Quay lại hoạt động', async ({ page }) => {
        await favoritesPage.goBack();
        await expect(page).not.toHaveURL(/favorites/);
    });

    test('TC_Fav_05: Chức năng - Bỏ thích 1 khóa học', async ({ page }) => {
        const initialCount = await favoritesPage.courseCards.count();
        console.log(`Số lượng trước khi xóa: ${initialCount}`);
        if (initialCount === 0) test.skip();

        // Xóa cái đầu tiên
        await favoritesPage.removeCourse(0);

        // 🔥 FIX QUAN TRỌNG: 
        await page.reload();

        await favoritesPage.verifyCardCount(initialCount - 1);
    });

    test('TC_Fav_06: Chức năng - Bấm Hủy (Cancel) xóa tất cả', async ({ page }) => {
        // 1. Lấy số lượng hiện tại
        const initialCount = await favoritesPage.courseCards.count();
        if (initialCount === 0) test.skip(); // Không có gì để test

        // 2. Dặn trình duyệt bấm CANCEL
        page.once('dialog', async dialog => {
            console.log('❌ Đang từ chối xóa...');
            await dialog.dismiss(); // Bấm Cancel
        });

        // 3. Bấm nút xóa
        await favoritesPage.clearAll();

        // 4. Verify: Số lượng vẫn giữ nguyên (Không bị xóa)
        // Cần reload để chắc chắn server không xóa ngầm
        await page.reload({ waitUntil: 'networkidle' });
        await favoritesPage.verifyCardCount(initialCount);
    });

    test('TC_Fav_07: Chức năng - Xóa tất cả (Có Confirm Dialog)', async ({ page }) => {
        // --- BƯỚC 1: LẮNG NGHE SỰ KIỆN DIALOG ---
        // Phải khai báo dòng này TRƯỚC khi bấm nút Xóa
        page.once('dialog', async dialog => {
            console.log(`💬 Hộp thoại hiện thông báo: "${dialog.message()}"`);

            // Chọn hành động bạn muốn:
            await dialog.accept(); // Tương đương bấm OK
            // await dialog.dismiss(); // Tương đương bấm Cancel
        });

        // --- BƯỚC 2: THỰC HIỆN HÀNH ĐỘNG ---
        // Lúc này bấm nút, hộp thoại hiện ra và Playwright sẽ tự động bấm OK nhờ lệnh bên trên
        await favoritesPage.clearAll();

        // --- BƯỚC 3: ĐỢI UI CẬP NHẬT & VERIFY ---
        // Tương tự bài trước, nếu UI không tự mất thì phải reload
        // Nếu web của bạn bấm OK xong nó tự mất thì bỏ dòng reload đi
        await page.reload({ waitUntil: 'networkidle' });

        // Verify danh sách trống
        await favoritesPage.verifyEmptyState();
    });
});