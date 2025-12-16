// tests/admin-users.spec.ts
import { test, expect } from '@playwright/test';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';

// --- IMPORT DATA TỪ FILE RIÊNG ---
import { mockStats, mockDefaultList, mockBuyerList, mockAdminList, mockSellerList } from '../data/mockUserData';

test.describe('Admin User Management', () => {
    let userPage: AdminUsersPage;

    test.beforeEach(async ({ page }) => {
        // 1. Setup Mock API bằng dữ liệu đã import
        await page.route('**/User/statistics', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    json: mockStats,
                });
            } else {
                await route.fallback();
            }
        });

        await page.route('**/User?*', async route => {
            const req = route.request();

            if (req.method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    json: mockDefaultList,
                });
            } else {
                await route.fallback();
            }
        });


        await page.route('**/User/role/*', async route => {
            const req = route.request();

            if (req.method() !== 'GET') {
                return route.fallback();
            }

            const url = req.url();

            if (url.includes('/Buyer')) {
                return route.fulfill({ status: 200, json: mockBuyerList });
            }

            if (url.includes('/Admin')) {
                return route.fulfill({ status: 200, json: mockAdminList });
            }

            if (url.includes('/Seller')) {
                return route.fulfill({ status: 200, json: mockSellerList });
            }

            await route.fallback();
        });



        await page.route('**/User?*search=*', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    json: mockDefaultList,
                });
            } else {
                await route.fallback();
            }
        });


        // 2. Đăng nhập & Init Page
        await loginAs(page, 'admin');
        userPage = new AdminUsersPage(page);
        await userPage.goto();
    });

    test('TC01: Nên hiển thị đúng số lượng thống kê (Mock Data)', async () => {
        // Data lấy từ file mockUserData.ts
        await expect(userPage.getStatNumberLocator('Người mua'))
            .toHaveText(mockStats.roleCounts.Buyer.toString());

        await expect(userPage.getStatNumberLocator('Người bán'))
            .toHaveText(mockStats.roleCounts.Seller.toString());

        // Bạn cũng có thể check luôn Admin và Tổng người dùng nếu muốn
        await expect(userPage.getStatNumberLocator('Quản trị viên'))
            .toHaveText(mockStats.roleCounts.Admin.toString());
    });

    test('TC02: Nên hiển thị danh sách người dùng đúng dữ liệu', async ({ page }) => {
        // Lấy user đầu tiên trong list default để test
        const testUser = mockDefaultList.items[0];

        const row = userPage.getUserRow(testUser.email);
        await expect(row).toBeVisible();
        await expect(row.locator('.users-cell--name')).toHaveText(testUser.fullName);
        // Lưu ý: Mock trả về "Buyer" (chữ thường đầu), UI hiển thị "BUYER" (uppercase) -> tùy CSS
        // Nếu CSS dùng text-transform: uppercase thì toHaveText vẫn check text gốc trong DOM
        // Nếu DOM thực sự là BUYER thì check 'BUYER'
        await expect(row.locator('.role-badge')).toHaveText('BUYER');
    });

    test('TC03: Xem chi tiết (View Modal) phải hiển thị đúng thông tin', async ({ page }) => {
        const testUser = mockDefaultList.items[0];

        await userPage.clickActionView(testUser.email);
        await expect(userPage.viewModal).toBeVisible();
        await expect(userPage.viewModal.locator('h3')).toHaveText('Thông Tin Người Dùng');

        const nameInput = userPage.viewModal.locator('input#edit-name');
        await expect(nameInput).toHaveValue(testUser.fullName);
        await expect(nameInput).not.toBeEditable();
    });

    test('TC04: Xóa người dùng (Delete Modal) phải hiển thị popup xác nhận', async ({ page }) => {
        const testUser = mockDefaultList.items[0];
        await userPage.clickActionDelete(testUser.email);

        const deleteHeader = page.locator('.users-modal h3', { hasText: 'Xác Nhận Xóa' });
        await expect(deleteHeader).toBeVisible();
    });

    test('TC05: Tìm kiếm người dùng hoạt động', async ({ page }) => {
        const keyword = 'An';
        await userPage.searchUser(keyword);

        const row = userPage.getUserRow('an.nguyen@gmail.com');
        await expect(row).toBeVisible();
    });

    test('TC06: Lọc theo Vai trò (Buyer) hiển thị đúng danh sách', async ({ page }) => {
        const [response] = await Promise.all([
            userPage.filterByRole('Buyer')
        ]);

        // 1. KIỂM TRA PHỦ ĐỊNH (Quan trọng nhất theo ý bạn)
        // Mong đợi: Không tìm thấy badge SELLER nào
        await expect(userPage.getRoleBadgeLocator('SELLER')).toHaveCount(0);

        // Mong đợi: Không tìm thấy badge ADMIN nào
        await expect(userPage.getRoleBadgeLocator('ADMIN')).toHaveCount(0);

        // 2. KIỂM TRA KHẲNG ĐỊNH (Để chắc chắn list không bị rỗng/lỗi)
        // Mong đợi: Ít nhất 1 dòng BUYER phải xuất hiện
        // .first() để lấy phần tử đầu tiên, kiểm tra nó hiển thị
        await expect(userPage.getRoleBadgeLocator('BUYER').first()).toBeVisible();
    });
});

test.describe('Admin Access Control - Users Page', () => {
    const ADMIN_USERS_URL = '/admin-users';
    const unauthorizedRoles: UserRole[] = ['buyer', 'seller'];

    for (const role of unauthorizedRoles) {
        test(`Role "${role}" should NOT access admin users page`, async ({ page }) => {
            // Vẫn cần mock stats để tránh lỗi console nếu FE gọi API ngầm
            await page.route('**/*stats*', async route => route.fulfill({ json: mockStats }));

            await verifyAccessDenied(page, role, ADMIN_USERS_URL);
        });
    }
});