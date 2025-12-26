// tests/specs/admin-transactions.spec.ts
import { test, expect } from '@playwright/test';
import { AdminTransactionsPage } from '../pages/AdminTransactionsPage';
import { loginAs, UserRole } from '../utils/authHelper';
import { verifyAccessDenied } from '../utils/permissionHelper';
import {
    mockCourseStats,
    mockStudentStats,
    mockFilteredCourse,
    mockFilteredStudent,
    TEST_CONSTANTS // Import constants
} from '../data/mockTransactionData';

test.describe('Admin Transaction Management', () => {
    let transPage: AdminTransactionsPage;

    test.beforeEach(async ({ page }) => {
        // --- 1. MOCK COURSE TRANSACTION API ---
        await page.route('**/Transactions/stats/courses*', async route => {
            const url = route.request().url();

            // Logic: If URL contains search keyword OR date range filter -> return filtered data
            const isSearching = url.includes(TEST_CONSTANTS.search.courseKeyword);
            const isFilteringDate = url.includes(TEST_CONSTANTS.filter.startDate) &&
                url.includes(TEST_CONSTANTS.filter.endDate);

            if (isSearching || isFilteringDate) {
                await route.fulfill({ json: mockFilteredCourse });
            } else {
                await route.fulfill({ json: mockCourseStats });
            }
        });

        // --- 2. MOCK STUDENT TRANSACTION API ---
        await page.route('**/Transactions/stats/students*', async route => {
            const url = route.request().url();

            // Logic: If URL contains searched student name -> return filtered data
            if (url.includes(TEST_CONSTANTS.search.studentKeyword)) {
                await route.fulfill({ json: mockFilteredStudent });
            } else {
                await route.fulfill({ json: mockStudentStats });
            }
        });

        // --- 3. LOGIN & INITIALIZATION ---
        await loginAs(page, 'admin');
        transPage = new AdminTransactionsPage(page);
        await transPage.goto();
    });

    test('TC01: Should switch tabs and display correct data (Courses vs Students)', async () => {
        // 1. Verify default state (Courses tab)
        await expect(transPage.tabCourse).toHaveClass(/active/);
        await expect(transPage.filterLabel).toHaveText(TEST_CONSTANTS.labels.tabCourse);

        // Data verification: get title from original mock data
        const defaultCourse = mockCourseStats.items[0].courseTitle;
        await expect(transPage.getRowByText(defaultCourse)).toBeVisible();

        // 2. Switch tab
        await transPage.switchToStudentTab();

        // 3. Verify after switching (Students tab)
        await expect(transPage.tabStudent).toHaveClass(/active/);
        await expect(transPage.filterLabel).toHaveText(TEST_CONSTANTS.labels.tabStudent);

        // Data verification: get student name from original mock data
        const defaultStudent = mockStudentStats.items[0].fullName;
        const studentRow = transPage.getRowByText(defaultStudent);
        await expect(studentRow).toBeVisible();

        // Verify currency format
        await expect(studentRow.locator('.revenue')).toContainText(TEST_CONSTANTS.uiFormat.studentRevenueStr);
    });

    test(`TC02: Should search courses by keyword "${TEST_CONSTANTS.search.courseKeyword}"`, async ({ page }) => {
        // Action
        await transPage.search(TEST_CONSTANTS.search.courseKeyword);

        // Verify: Returned data matches mockFilteredCourse
        const expectedCourse = mockFilteredCourse.items[0].courseTitle;
        const row = transPage.getRowByText(expectedCourse);
        await expect(row).toBeVisible();

        // Negative verification: Non-matching data should not be displayed
        // (Second item from original mock list)
        const unexpectedCourse = mockCourseStats.items[1].courseTitle;
        await expect(transPage.getRowByText(unexpectedCourse)).not.toBeVisible();
    });

    test(`TC03: Should search students by name "${TEST_CONSTANTS.search.studentKeyword}"`, async ({ page }) => {
        // Action
        await transPage.switchToStudentTab();
        await transPage.search(TEST_CONSTANTS.search.studentKeyword);

        // Verify
        const expectedStudent = mockFilteredStudent.items[0].fullName;
        const row = transPage.getRowByText(expectedStudent);
        await expect(row).toBeVisible();

        // Verify revenue display format
        await expect(row.locator('.revenue')).toContainText(TEST_CONSTANTS.uiFormat.studentRevenueStr);
    });

    test('TC04: Should filter by date range (Courses)', async () => {
        // Action
        await transPage.filterByDate(TEST_CONSTANTS.filter.startDate, TEST_CONSTANTS.filter.endDate);

        // Verify row existence
        const expectedCourse = mockFilteredCourse.items[0].courseTitle;
        const row = transPage.getRowByText(expectedCourse);
        await expect(row).toBeVisible();

        // Verify date column
        // (Check the last column contains the expected display date)
        await expect(row.locator('td').last()).toContainText(TEST_CONSTANTS.filter.expectedDateDisplay);
    });

    test('TC05: Should display correct title when viewing transaction details', async ({ page }) => {
        await transPage.viewDetail();

        const title = page.locator('h1.course-tx-title');
        await expect(title).toBeVisible();
        await expect(title).toHaveText(TEST_CONSTANTS.labels.detailHeader);
    });
});

test.describe('Admin Access Control - Transactions', () => {
    const TRANSACTIONS_URL = '/transactions';
    const unauthorizedRoles: UserRole[] = ['buyer', 'seller'];

    for (const role of unauthorizedRoles) {
        test(`Role "${role}" should NOT access transactions page`, async ({ page }) => {
            // Mock API to prevent network console errors during redirect
            await page.route('**/Transactions/stats/**', async route =>
                route.fulfill({ json: mockCourseStats })
            );
            await verifyAccessDenied(page, role, TRANSACTIONS_URL);
        });
    }
});
