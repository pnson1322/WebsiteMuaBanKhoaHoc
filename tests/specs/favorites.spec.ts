import { test, expect } from '@playwright/test';
import { FavoritesPage } from '../pages/FavoritesPage';
import { loginAs } from '../utils/authHelper';

test.describe('Buyer Favorites Feature', () => {
    let favoritesPage: FavoritesPage;

    // --- SETUP: Login & Chuẩn bị dữ liệu ---
    test.beforeEach(async ({ page }) => {
        // 1. Đăng nhập với quyền Buyer
        await loginAs(page, 'buyer');

        // 2. Khởi tạo Page Object
        favoritesPage = new FavoritesPage(page);
        await favoritesPage.goto();

        // 3. AUTO-HEALING DATA (Tự động chữa lỗi thiếu dữ liệu)
        // Kiểm tra xem danh sách có trống không?
        const count = await favoritesPage.courseCards.count();

        if (count === 0) {
            console.log('⚠️ Danh sách yêu thích đang trống. Đang tự động thêm khóa học...');

            // Quay ra trang chủ
            await page.goto('/');

            // Tìm nút tim đầu tiên chưa được like (chưa có class .favorite) và bấm vào
            // Lưu ý: Selector này phụ thuộc vào trang Home của bạn
            // Giả sử ở Home nút tim chưa like là .favorite-button (ko có class favorite)
            const heartBtn = page.locator('.course-card .favorite-button:not(.favorite)').first();

            if (await heartBtn.isVisible()) {
                await heartBtn.click();
                console.log('✅ Đã thêm 1 khóa học vào yêu thích.');
            } else {
                console.log('⚠️ Không tìm thấy khóa học nào để like ở Home.');
            }

            // Quay lại trang Favorites để bắt đầu test
            await favoritesPage.goto();
        }
    });

    // --- TEST CASES ---

    test('TC_Fav_01: UI - Hiển thị đúng thông tin Card', async () => {
        // Lấy card đầu tiên để check
        const card = favoritesPage.getCard(0);

        await expect(card).toBeVisible();
        await expect(card.locator('.course-title')).toBeVisible(); // Tên
        await expect(card.locator('.course-image')).toBeVisible(); // Ảnh
        await expect(card.locator('.course-price')).toBeVisible(); // Giá tiền

        // Check 2 nút quan trọng
        await expect(card.locator('.add-to-cart-btn')).toBeVisible();
        await expect(card.locator('.view-details-btn')).toBeVisible();
    });

    test('TC_Fav_02: Chức năng - Thêm vào giỏ hàng', async () => {
        // Hành động
        await favoritesPage.addToCart(0);

        // Kiểm tra: Nút đổi trạng thái (Text chuyển thành "Đã thêm")
        await favoritesPage.verifyAddToCartSuccess(0);
    });

    test('TC_Fav_03: Điều hướng - Xem chi tiết bằng nút con mắt', async ({ page }) => {
        await favoritesPage.clickDetailButton(0);

        // Kiểm tra URL thay đổi (ko còn ở trang favorites)
        await expect(page).not.toHaveURL(/favorites/);
        // Kiểm tra URL chứa từ khóa chi tiết (tùy router của bạn)
        // Ví dụ: /course/machine-learning...
        // await expect(page).toHaveURL(/\/course\//); 
    });

    test('TC_Fav_04: Điều hướng - Nút Quay lại hoạt động', async ({ page }) => {
        await favoritesPage.goBack();

        // Kiểm tra URL không còn chứa 'favorites'
        await expect(page).not.toHaveURL(/favorites/);
    });

    test('TC_Fav_05: Chức năng - Bỏ thích 1 khóa học', async () => {
        const initialCount = await favoritesPage.courseCards.count();
        console.log(`Số lượng trước khi xóa: ${initialCount}`);

        // Xóa khóa học đầu tiên
        await favoritesPage.removeCourse(0);

        // Kiểm tra số lượng giảm đi 1
        await favoritesPage.verifyCardCount(initialCount - 1);
    });

    test('TC_Fav_06: Chức năng - Xóa tất cả', async () => {
        // Nút này nguy hiểm, sẽ xóa sạch data
        await favoritesPage.clearAll();

        // Kiểm tra list trống
        await favoritesPage.verifyEmptyState();
    });
});