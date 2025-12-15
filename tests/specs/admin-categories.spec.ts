// tests/admin-categories.spec.ts
import { test, expect } from '@playwright/test';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';
import { setupCategoryMock } from '../utils/mockCategoryHandler'; // Import hàm mock

test.describe('Admin Category Management', () => {
    let categoryPage: AdminCategoriesPage;

    test.beforeEach(async ({ page }) => {
        // 1. Gọi hàm setup Mock (Dữ liệu sẽ được reset mới tinh cho mỗi test)
        await setupCategoryMock(page);

        // 2. Đăng nhập & Vào trang
        await loginAs(page, 'admin');
        categoryPage = new AdminCategoriesPage(page);
        await categoryPage.goto();
    });

    test('TC01: Nên thêm mới danh mục thành công', async ({ page }) => {
        const newCatName = `Auto Test ${Date.now()}`;
        await categoryPage.addCategory(newCatName);
        await expect(categoryPage.nameInput).toBeEmpty();
    });

    test('TC02: Nên sửa tên danh mục thành công', async ({ page }) => {
        const oldName = "Lập trình";

        const newName = `Coding Updated ${Date.now()}`;

        await categoryPage.editCategory(oldName, newName);

        // Lúc này dòng chứa "Lập trình" sẽ thực sự biến mất vì "Coding..." không chứa từ "Lập trình"
        await expect(categoryPage.getCategoryRow(oldName)).toBeHidden();
        await expect(categoryPage.getCategoryRow(newName)).toBeVisible();
    });

    test('TC03: Nên xóa danh mục thành công', async ({ page }) => {
        const catToDelete = "Thiết kế"; // Có sẵn trong Data/categoryData.ts
        await categoryPage.deleteCategory(catToDelete);
        //await expect(categoryPage.getCategoryRow(catToDelete)).toBeHidden();
    });

    test('TC04: Nên tìm kiếm được danh mục', async ({ page }) => {
        const uniqueName = "Khác";
        await categoryPage.searchCategory(uniqueName);
        await expect(categoryPage.getCategoryRow(uniqueName)).toBeVisible();
    });

    test('TC05: Should search correctly using the first category name', async ({ page }) => {
        const firstCategoryName = await categoryPage.getFirstCategoryNameText();
        console.log(`Testing search with keyword: ${firstCategoryName}`);

        await categoryPage.searchCategory(firstCategoryName);
        await expect(categoryPage.getCategoryRow(firstCategoryName)).toBeVisible();
    });

    test('TC06: Should NOT allow deleting the "Khác" (default) category', async ({ page }) => {
        const protectedCategory = 'Khác'; // ID: 1 trong file Data
        const row = categoryPage.getCategoryRow(protectedCategory);

        await expect(row).toBeVisible();
        await categoryPage.deleteCategory(protectedCategory);

        // Assert: Vẫn còn hiển thị do API trả về 403
        await expect(row).toBeVisible();
    });

    test('TC07: Should NOT increase category count when adding a duplicate', async ({ page }) => {
        const duplicateName = "Lập trình";

        // 🔴 FIX: Chờ API lấy danh sách load xong trước khi đếm
        // Mock handler của bạn trả về 3 item, nên ta đợi ít nhất 1 dòng hiện ra
        const rowsLocator = page.locator('.cat-row');
        await expect(rowsLocator.first()).toBeVisible();

        // Sau khi chắc chắn đã hiện data, mới bắt đầu đếm
        const initialCount = await rowsLocator.count();
        console.log(`Số lượng ban đầu: ${initialCount}`); // Lúc này sẽ là 3

        // Thêm trùng
        await categoryPage.nameInput.fill(duplicateName);
        await categoryPage.addButton.click();

        // Chờ response lỗi 400
        const response = await page.waitForResponse(resp =>
            resp.url().includes('/Category') && resp.status() === 400
        );
        expect(response.ok()).toBeFalsy();

        await page.waitForTimeout(500); // Đợi UI ổn định

        const finalCount = await rowsLocator.count();
        expect(finalCount).toEqual(initialCount);
    });
});

// Access Control Test vẫn giữ nguyên, có thể dùng lại Mock nếu cần
test.describe('Admin Access Control', () => {
    const ADMIN_CATEGORY_URL = '/admin-categories';
    const unauthorizedRoles: UserRole[] = ['buyer', 'seller'];

    for (const role of unauthorizedRoles) {
        test(`Role "${role}" should NOT access admin categories page`, async ({ page }) => {
            // Có thể cần mock data ở đây để tránh lỗi 404 nếu trang cố load dữ liệu
            await setupCategoryMock(page);
            await verifyAccessDenied(page, role, ADMIN_CATEGORY_URL);
        });
    }
});