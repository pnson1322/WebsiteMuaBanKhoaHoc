import { test, expect } from '@playwright/test';
import { FavoritesPage } from '../pages/FavoritesPage';
import { loginAs } from '../utils/authHelper';
// Import mock data from separate file
import { initialMockFavorites } from '../data/mockFavoritesData';

test.describe('Buyer Favorites Feature (Mock Data)', () => {
    let favoritesPage: FavoritesPage;

    // This variable acts as an in-memory "temporary database" for the test chain
    let currentFavorites: any[] = [];

    // Reset the in-memory database to its initial state before the test suite starts
    test.beforeAll(() => {
        // [IMPORTANT] Deep copy to avoid mutating original mock data
        currentFavorites = JSON.parse(JSON.stringify(initialMockFavorites));
    });

    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'buyer');
        favoritesPage = new FavoritesPage(page);

        // --- MOCK API (Simulated Server Logic) ---

        // 1. GET: Retrieve favorites list (GET /Favorite)
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

        // 2. DELETE ALL: Clear all favorites (DELETE /Favorite/clear)
        // Note: This route should be defined before others or use a specific string
        // to ensure Playwright matches it with higher priority
        await page.route('**/Favorite/clear', async route => {
            if (route.request().method() === 'DELETE') {
                currentFavorites = []; // Clear the in-memory array

                // According to API spec: return 204 No Content
                await route.fulfill({
                    status: 204
                    // 204 responses have no body
                });
            } else {
                await route.fallback();
            }
        });

        // 3. DELETE ONE: Remove a single item by ID (DELETE /Favorite/{courseId})
        // Use regex to only match URLs ending with a numeric ID
        // to avoid accidentally matching the "clear" endpoint
        await page.route(/\/Favorite\/\d+$/, async route => {
            if (route.request().method() === 'DELETE') {
                const url = route.request().url();
                const idToDelete = url.split('/').pop(); // Extract ID from URL

                // Remove item from in-memory array
                currentFavorites = currentFavorites.filter(
                    c => c.courseId.toString() !== idToDelete
                );

                // According to API spec: return JSON message
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ "message": "Course removed from favorites." })
                });
            } else {
                await route.fallback();
            }
        });

        // 4. Mock Cart API (POST /api/Cart/items/{courseId})
        await page.route('**/api/Cart/items/*', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200, // Or 201 depending on actual backend behavior
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: "Added to cart" })
                });
            } else {
                await route.fallback();
            }
        });

        // --- END MOCK SETUP ---

        await favoritesPage.goto();
    });

    // --- TEST CASES ---

    test('TC_Fav_01: UI - Should display correct card information', async () => {
        // Initial mock data contains 2 items
        await favoritesPage.verifyCardCount(2);

        // Verify first card
        const firstCard = favoritesPage.getCard(0);
        await expect(firstCard.locator('.course-title'))
            .toHaveText(initialMockFavorites[0].title);
    });

    test('TC_Fav_02: Functionality - Add course to cart', async () => {
        // Test add-to-cart button (calls POST /api/Cart/items/...)
        await favoritesPage.addToCart(0);
        await favoritesPage.verifyAddToCartSuccess(0);
    });

    test('TC_Fav_03: Navigation - View course details', async ({ page }) => {
        const courseId = initialMockFavorites[0].courseId;
        await favoritesPage.clickDetailButton(0);
        await expect(page).toHaveURL(new RegExp(`/course/${courseId}`));
    });

    test('TC_Fav_04: Navigation - Go back', async ({ page }) => {
        await page.goto('/');
        await favoritesPage.goto();
        await favoritesPage.goBack();
        await expect(page).toHaveURL('/');
    });

    test('TC_Fav_05: Functionality - Remove a single favorite course', async ({ page }) => {
        const initialCount = currentFavorites.length; // Expected: 2

        // Remove the first item (courseId = 13)
        // This triggers DELETE /Favorite/13 -> mock updates currentFavorites
        await favoritesPage.removeCourse(0);

        // Reload to trigger GET /Favorite -> returns updated currentFavorites
        await page.reload();

        // Verify count decreased by 1
        await favoritesPage.verifyCardCount(initialCount - 1);

        // Verify remaining item is the second one (courseId = 14)
        const card = favoritesPage.getCard(0);
        await expect(card.locator('.course-title'))
            .toHaveText(initialMockFavorites[1].title);
    });

    test('TC_Fav_06: Functionality - Cancel clear all favorites', async ({ page }) => {
        // At this point, currentFavorites should contain 1 item
        const countBefore = currentFavorites.length;

        page.once('dialog', async dialog => {
            await dialog.dismiss(); // Click Cancel
        });

        await favoritesPage.clearAll();

        // Reload should still show the same data because DELETE was canceled
        await page.reload();
        await favoritesPage.verifyCardCount(countBefore);
    });

    test('TC_Fav_07: Functionality - Clear all favorites (Confirm)', async ({ page }) => {
        page.once('dialog', async dialog => {
            await dialog.accept(); // Click OK
        });

        // This triggers DELETE /Favorite/clear -> mock sets currentFavorites = []
        await favoritesPage.clearAll();

        // Reload triggers GET /Favorite -> returns empty array
        await page.reload();
        await favoritesPage.verifyEmptyState();
    });
});

test.describe('Buyer Access Control', () => {
    test('Admin role should NOT access Buyer favorites page', async ({ page }) => {
        await loginAs(page, 'admin');
        const categoryPage = new FavoritesPage(page);
        await categoryPage.goto();

        await expect(categoryPage.accessDeniedMessage).toBeVisible();
        await expect(categoryPage.accessDeniedMessage)
            .toHaveCSS('color', 'rgb(239, 68, 68)');
    });

    test('Seller role should NOT access Buyer favorites page', async ({ page }) => {
        await loginAs(page, 'seller');
        const categoryPage = new FavoritesPage(page);
        await categoryPage.goto();

        await expect(categoryPage.accessDeniedMessage).toBeVisible();
        await expect(categoryPage.accessDeniedMessage)
            .toHaveCSS('color', 'rgb(239, 68, 68)');
    });
});
