// tests/utils/permissionHelper.ts
import { Page, expect } from '@playwright/test';
import { loginAs, UserRole } from './authHelper'; // Import đúng file authHelper của bạn

// ⚠️ Định nghĩa Locator chung cho thông báo lỗi.
const ACCESS_DENIED_SELECTOR = 'text="Truy cập bị từ chối"';

/**
 * Helper kiểm tra xem một Role có bị chặn khi vào URL cấm hay không
 * @param page - Playwright Page object
 * @param role - Role cần test ('buyer' | 'seller')
 * @param targetUrl - Link trang admin cần test (VD: '/admin/categories')
 */
export async function verifyAccessDenied(page: Page, role: UserRole, targetUrl: string) {
    // 1. Dùng hàm loginAs 
    await loginAs(page, role);

    // 2. Cố tình truy cập trang cấm
    await page.goto(targetUrl);

    // 3. Assert: Kiểm tra thông báo lỗi xuất hiện
    const messageLocator = page.locator(ACCESS_DENIED_SELECTOR);

    await expect(messageLocator).toBeVisible({ timeout: 10000 });

    await expect(messageLocator).toHaveCSS('color', 'rgb(239, 68, 68)');
}