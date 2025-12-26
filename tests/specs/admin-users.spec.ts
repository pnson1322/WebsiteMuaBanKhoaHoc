// tests/admin-users.spec.ts
import { test, expect } from '@playwright/test';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';

// --- IMPORT MOCK DATA FROM SEPARATE FILE ---
import { mockStats, mockDefaultList, mockBuyerList, mockAdminList, mockSellerList } from '../data/mockUserData';

test.describe('Admin User Management', () => {
    let userPage: AdminUsersPage;

    test.beforeEach(async ({ page }) => {
        // 1. Setup mock APIs using imported mock data
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

        // 2. Login and initialize page object
        await loginAs(page, 'admin');
        userPage = new AdminUsersPage(page);
        await userPage.goto();
    });

    test('TC01: Should display correct statistic counts (Mock Data)', async () => {
        // Data sourced from mockUserData.ts
        await expect(userPage.getStatNumberLocator('Người mua'))
            .toHaveText(mockStats.roleCounts.Buyer.toString());

        await expect(userPage.getStatNumberLocator('Người bán'))
            .toHaveText(mockStats.roleCounts.Seller.toString());

        // Optional: also verify Admin and Total user counts
        await expect(userPage.getStatNumberLocator('Quản trị viên'))
            .toHaveText(mockStats.roleCounts.Admin.toString());
    });

    test('TC02: Should display correct user list data', async ({ page }) => {
        // Use the first user in the default list for testing
        const testUser = mockDefaultList.items[0];

        const row = userPage.getUserRow(testUser.email);
        await expect(row).toBeVisible();
        await expect(row.locator('.users-cell--name')).toHaveText(testUser.fullName);

        // Note:
        // Mock returns role as "Buyer" (capitalized),
        // UI displays "BUYER" (uppercase) depending on CSS.
        // If CSS uses text-transform: uppercase, toHaveText still checks the original DOM text.
        // If DOM text is actually "BUYER", then check against "BUYER".
        await expect(row.locator('.role-badge')).toHaveText('BUYER');
    });

    test('TC03: View details modal should display correct information', async ({ page }) => {
        const testUser = mockDefaultList.items[0];

        await userPage.clickActionView(testUser.email);
        await expect(userPage.viewModal).toBeVisible();
        await expect(userPage.viewModal.locator('h3')).toHaveText('Thông Tin Người Dùng');

        const nameInput = userPage.viewModal.locator('input#edit-name');
        await expect(nameInput).toHaveValue(testUser.fullName);
        await expect(nameInput).not.toBeEditable();
    });

    test('TC04: Delete user action should display confirmation modal', async ({ page }) => {
        const testUser = mockDefaultList.items[0];
        await userPage.clickActionDelete(testUser.email);

        const deleteHeader = page.locator('.users-modal h3', { hasText: 'Xác Nhận Xóa' });
        await expect(deleteHeader).toBeVisible();
    });

    test('TC05: Should successfully search active users', async ({ page }) => {
        const keyword = 'An';
        await userPage.searchUser(keyword);

        const row = userPage.getUserRow('an.nguyen@gmail.com');
        await expect(row).toBeVisible();
    });

    test('TC06: Filter by role (Buyer) should display correct user list', async ({ page }) => {
        const [response] = await Promise.all([
            userPage.filterByRole('Buyer')
        ]);

        // 1. NEGATIVE VERIFICATION (Most important as requested)
        // Expect: No SELLER badges should be found
        await expect(userPage.getRoleBadgeLocator('SELLER')).toHaveCount(0);

        // Expect: No ADMIN badges should be found
        await expect(userPage.getRoleBadgeLocator('ADMIN')).toHaveCount(0);

        // 2. POSITIVE VERIFICATION (Ensure the list is not empty or broken)
        // Expect: At least one BUYER row should be displayed
        // Use .first() to get the first element and verify visibility
        await expect(userPage.getRoleBadgeLocator('BUYER').first()).toBeVisible();
    });
});

test.describe('Admin Access Control - Users Page', () => {
    const ADMIN_USERS_URL = '/admin-users';
    const unauthorizedRoles: UserRole[] = ['buyer', 'seller'];

    for (const role of unauthorizedRoles) {
        test(`Role "${role}" should NOT access admin users page`, async ({ page }) => {
            // Still need to mock stats to prevent console errors
            // if the frontend implicitly calls statistics APIs
            await page.route('**/*stats*', async route => route.fulfill({ json: mockStats }));

            await verifyAccessDenied(page, role, ADMIN_USERS_URL);
        });
    }
});
