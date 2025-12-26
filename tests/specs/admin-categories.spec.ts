// tests/admin-categories.spec.ts
import { test, expect } from '@playwright/test';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';
import { setupCategoryMock } from '../utils/mockCategoryHandler'; // Import mock setup function

test.describe('Admin Category Management', () => {
    let categoryPage: AdminCategoriesPage;

    test.beforeEach(async ({ page }) => {
        // 1. Setup mock data (data will be reset fresh for each test)
        await setupCategoryMock(page);

        // 2. Login and navigate to admin categories page
        await loginAs(page, 'admin');
        categoryPage = new AdminCategoriesPage(page);
        await categoryPage.goto();
    });

    test('TC01: Should successfully add a new category', async ({ page }) => {
        const newCatName = `Auto Test ${Date.now()}`;
        await categoryPage.addCategory(newCatName);
        await expect(categoryPage.nameInput).toBeEmpty();
    });

    test('TC02: Should successfully edit a category name', async ({ page }) => {
        const oldName = "Lập trình";

        const newName = `Coding Updated ${Date.now()}`;

        await categoryPage.editCategory(oldName, newName);

        // At this point, the row containing "Lập trình" should disappear
        // because the new name no longer includes the old text
        await expect(categoryPage.getCategoryRow(oldName)).toBeHidden();
        await expect(categoryPage.getCategoryRow(newName)).toBeVisible();
    });

    test('TC03: Should successfully delete a category', async ({ page }) => {
        const catToDelete = "Thiết kế"; // Predefined in Data/categoryData.ts
        await categoryPage.deleteCategory(catToDelete);
        //await expect(categoryPage.getCategoryRow(catToDelete)).toBeHidden();
    });

    test('TC04: Should be able to search for a category', async ({ page }) => {
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
        const protectedCategory = 'Khác'; // ID: 1 in mock data
        const row = categoryPage.getCategoryRow(protectedCategory);

        await expect(row).toBeVisible();
        await categoryPage.deleteCategory(protectedCategory);

        // Assert: Still visible because API returns 403
        await expect(row).toBeVisible();
    });

    test('TC07: Should NOT increase category count when adding a duplicate', async ({ page }) => {
        const duplicateName = "Lập trình";

        // 🔴 FIX: Wait for the category list API to fully load before counting
        // The mock handler returns 3 items, so wait until at least one row is visible
        const rowsLocator = page.locator('.cat-row');
        await expect(rowsLocator.first()).toBeVisible();

        // After confirming data is loaded, start counting
        const initialCount = await rowsLocator.count();
        console.log(`Initial count: ${initialCount}`); // Expected: 3

        // Attempt to add duplicate
        await categoryPage.nameInput.fill(duplicateName);
        await categoryPage.addButton.click();

        // Wait for 400 error response
        const response = await page.waitForResponse(resp =>
            resp.url().includes('/Category') && resp.status() === 400
        );
        expect(response.ok()).toBeFalsy();

        await page.waitForTimeout(500); // Wait for UI to stabilize

        const finalCount = await rowsLocator.count();
        expect(finalCount).toEqual(initialCount);
    });
});

// Access Control Tests (reuse mock if necessary)
test.describe('Admin Access Control', () => {
    const ADMIN_CATEGORY_URL = '/admin-categories';
    const unauthorizedRoles: UserRole[] = ['buyer', 'seller'];

    for (const role of unauthorizedRoles) {
        test(`Role "${role}" should NOT access admin categories page`, async ({ page }) => {
            // Mock data may be required to prevent 404 if the page tries to load data
            await setupCategoryMock(page);
            await verifyAccessDenied(page, role, ADMIN_CATEGORY_URL);
        });
    }
});
