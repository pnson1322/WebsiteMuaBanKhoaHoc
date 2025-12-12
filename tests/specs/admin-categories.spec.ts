// tests/admin-categories.spec.ts
import { test, expect } from '@playwright/test';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';

// Hàm tạo tên ngẫu nhiên
const generateCategoryName = () => `Auto Test ${Date.now()}`;

test.describe('Admin Category Management', () => {
    let categoryPage: AdminCategoriesPage;

    // Hook chạy trước mỗi test case
    test.beforeEach(async ({ page }) => {
        // 1. Đăng nhập (Lưu ý: Bạn cũng nên sửa LoginPage dùng relative path nếu chưa sửa)
        await loginAs(page, 'admin');

        // 2. Khởi tạo Page Object
        categoryPage = new AdminCategoriesPage(page);

        // 3. Truy cập trang danh mục (sẽ dùng baseURL + /admin-categories)
        await categoryPage.goto();
    });

    test('TC01: Nên thêm mới danh mục thành công', async ({ page }) => {
        const newCatName = generateCategoryName();

        await categoryPage.addCategory(newCatName);

        // Kiểm tra input đã được clear
        await expect(categoryPage.nameInput).toBeEmpty();
    });

    test('TC02: Nên sửa tên danh mục thành công', async ({ page }) => {
        const oldName = generateCategoryName();
        await categoryPage.addCategory(oldName);

        // ✅ MỚI: Tạo một tên khác hẳn để không bị trùng text
        const newName = `Category Updated ${Date.now()}`;

        await categoryPage.editCategory(oldName, newName);

        await expect(categoryPage.getCategoryRow(oldName)).toBeHidden();
        await expect(categoryPage.getCategoryRow(newName)).toBeVisible();
    });

    test('TC03: Nên xóa danh mục thành công', async ({ page }) => {
        const catToDelete = generateCategoryName();
        await categoryPage.addCategory(catToDelete);

        await categoryPage.deleteCategory(catToDelete);

        await expect(categoryPage.getCategoryRow(catToDelete)).toBeHidden();
    });

    test('TC04: Nên tìm kiếm được danh mục', async ({ page }) => {
        const uniqueName = `Search Me ${Date.now()}`;
        await categoryPage.addCategory(uniqueName);

        await categoryPage.searchCategory(uniqueName);

        // Kiểm tra kết quả filter
        await expect(categoryPage.getCategoryRow(uniqueName)).toBeVisible();

        // (Optional) Kiểm tra số lượng dòng hiển thị là 1 (nếu search chính xác)
    });

    test('TC05: Should search correctly using the first category name', async ({ page }) => {
        // 1. Lấy tên danh mục đầu tiên đang có trong bảng
        // (Đảm bảo bảng có dữ liệu, nếu không test sẽ fail ở đây)
        const firstCategoryName = await categoryPage.getFirstCategoryNameText();
        console.log(`Testing search with keyword: ${firstCategoryName}`);

        // 2. Thực hiện search
        await categoryPage.searchCategory(firstCategoryName);

        // 3. Assert: Dòng chứa tên đó phải hiện
        await expect(categoryPage.getCategoryRow(firstCategoryName)).toBeVisible();

        // 4. Assert: Các dòng KHÔNG chứa tên đó phải bị ẩn (Optional)
        // Logic: Lấy tất cả row hiện tại, row nào visible phải chứa text search
    });

    test('TC06: Should NOT allow deleting the "Khác" (default) category', async ({ page }) => {
        const protectedCategory = 'Khác';

        // 1. Kiểm tra danh mục "Khác" có tồn tại không
        const row = categoryPage.getCategoryRow(protectedCategory);
        await expect(row).toBeVisible();

        // 2. Thực hiện hành động xóa
        // Lưu ý: Page Object đã handle việc click Delete -> Click Confirm Modal
        await categoryPage.deleteCategory(protectedCategory);

        // 3. Assert QUAN TRỌNG: 
        // Sau khi xác nhận xóa, danh mục "Khác" VẪN PHẢI CÒN ĐÓ (không được mất đi)
        await expect(row).toBeVisible();

        // (Mở rộng): Nếu hệ thống hiện Toast Error, bạn có thể bắt thêm ở đây
        // VD: await expect(page.getByText('Không thể xóa danh mục mặc định')).toBeVisible();
    });

    test('TC07: Should NOT increase category count when adding a duplicate', async ({ page }) => {
        const duplicateName = generateCategoryName();

        // 1. Thêm danh mục lần đầu (Hợp lệ)
        await categoryPage.addCategory(duplicateName);

        // Đảm bảo dòng đó đã hiện lên trước khi đếm
        await expect(categoryPage.getCategoryRow(duplicateName)).toBeVisible();

        // 2. Lấy số lượng dòng hiện tại (Số lượng gốc)
        // Giả sử bảng của bạn dùng thẻ <tr> trong <tbody>
        // Bạn có thể đưa hàm này vào Page Object để tái sử dụng
        const rowsLocator = page.locator('tbody tr');
        const initialCount = await rowsLocator.count();
        console.log(`Số lượng ban đầu: ${initialCount}`);

        // 3. Cố tình thêm lại đúng tên đó lần thứ 2
        await categoryPage.addCategory(duplicateName);

        try {
            // Chờ một response từ API tạo category (sửa URL API cho đúng với dự án của bạn)
            await page.waitForResponse(resp =>
                resp.url().includes('/categories') && resp.status() !== 200,
                { timeout: 3000 }
            );
        } catch (e) {
            // Nếu không bắt được response thì chờ cứng 1 xíu để UI ổn định
            await page.waitForTimeout(1000);
        }

        // 4. Lấy lại số lượng dòng sau khi thêm
        const finalCount = await rowsLocator.count();
        console.log(`Số lượng sau khi thêm trùng: ${finalCount}`);

        // 5. Assert: Số lượng TRƯỚC và SAU phải BẰNG NHAU
        expect(finalCount).toEqual(initialCount);
    });

});

test.describe('Admin Access Control', () => {

    // Nếu trong PageObject bạn có thuộc tính url, có thể export ra dùng.
    const ADMIN_CATEGORY_URL = '/admin-categories';

    // Danh sách các Role KHÔNG được phép vào trang này
    const unauthorizedRoles: UserRole[] = ['buyer', 'seller'];

    for (const role of unauthorizedRoles) {
        test(`Role "${role}" should NOT access admin categories page`, async ({ page }) => {
            await verifyAccessDenied(page, role, ADMIN_CATEGORY_URL);
        });
    }
});