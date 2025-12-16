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
    TEST_CONSTANTS // Import hằng số
} from '../data/mockTransactionData';

test.describe('Admin Transaction Management', () => {
    let transPage: AdminTransactionsPage;

    test.beforeEach(async ({ page }) => {
        // --- 1. MOCK API KHÓA HỌC ---
        await page.route('**/Transactions/stats/courses*', async route => {
            const url = route.request().url();

            // Logic: Nếu URL chứa keyword search HOẶC khoảng ngày filter -> Trả về data đã lọc
            const isSearching = url.includes(TEST_CONSTANTS.search.courseKeyword);
            const isFilteringDate = url.includes(TEST_CONSTANTS.filter.startDate) &&
                url.includes(TEST_CONSTANTS.filter.endDate);

            if (isSearching || isFilteringDate) {
                await route.fulfill({ json: mockFilteredCourse });
            } else {
                await route.fulfill({ json: mockCourseStats });
            }
        });

        // --- 2. MOCK API HỌC VIÊN ---
        await page.route('**/Transactions/stats/students*', async route => {
            const url = route.request().url();

            // Logic: Nếu URL chứa tên học viên cần tìm -> Trả về data đã lọc
            if (url.includes(TEST_CONSTANTS.search.studentKeyword)) {
                await route.fulfill({ json: mockFilteredStudent });
            } else {
                await route.fulfill({ json: mockStudentStats });
            }
        });

        // --- 3. LOGIN & INIT ---
        await loginAs(page, 'admin');
        transPage = new AdminTransactionsPage(page);
        await transPage.goto();
    });

    test('TC01: Chuyển tab và hiển thị đúng dữ liệu (Courses vs Students)', async () => {
        // 1. Kiểm tra mặc định (Tab Khóa Học)
        await expect(transPage.tabCourse).toHaveClass(/active/);
        await expect(transPage.filterLabel).toHaveText(TEST_CONSTANTS.labels.tabCourse);

        // Data verify: Lấy title từ mock gốc để so sánh
        const defaultCourse = mockCourseStats.items[0].courseTitle;
        await expect(transPage.getRowByText(defaultCourse)).toBeVisible();

        // 2. Chuyển Tab
        await transPage.switchToStudentTab();

        // 3. Kiểm tra sau khi chuyển (Tab Học Viên)
        await expect(transPage.tabStudent).toHaveClass(/active/);
        await expect(transPage.filterLabel).toHaveText(TEST_CONSTANTS.labels.tabStudent);

        // Data verify: Lấy tên học viên từ mock gốc
        const defaultStudent = mockStudentStats.items[0].fullName;
        const studentRow = transPage.getRowByText(defaultStudent);
        await expect(studentRow).toBeVisible();

        // Verify định dạng tiền tệ
        await expect(studentRow.locator('.revenue')).toContainText(TEST_CONSTANTS.uiFormat.studentRevenueStr);
    });

    test(`TC02: Tìm kiếm khóa học theo từ khóa "${TEST_CONSTANTS.search.courseKeyword}"`, async ({ page }) => {
        // Action
        await transPage.search(TEST_CONSTANTS.search.courseKeyword);

        // Verify: Dữ liệu trả về khớp với mockFilteredCourse
        const expectedCourse = mockFilteredCourse.items[0].courseTitle;
        const row = transPage.getRowByText(expectedCourse);
        await expect(row).toBeVisible();

        // Verify Negative: Dữ liệu không khớp không được hiển thị (Item thứ 2 trong list gốc)
        const unexpectedCourse = mockCourseStats.items[1].courseTitle;
        await expect(transPage.getRowByText(unexpectedCourse)).not.toBeVisible();
    });

    test(`TC03: Tìm kiếm học viên theo tên "${TEST_CONSTANTS.search.studentKeyword}"`, async ({ page }) => {
        // Action
        await transPage.switchToStudentTab();
        await transPage.search(TEST_CONSTANTS.search.studentKeyword);

        // Verify
        const expectedStudent = mockFilteredStudent.items[0].fullName;
        const row = transPage.getRowByText(expectedStudent);
        await expect(row).toBeVisible();

        // Check revenue hiển thị đúng
        await expect(row.locator('.revenue')).toContainText(TEST_CONSTANTS.uiFormat.studentRevenueStr);
    });

    test('TC04: Lọc theo khoảng thời gian (Khóa học)', async () => {
        // Action
        await transPage.filterByDate(TEST_CONSTANTS.filter.startDate, TEST_CONSTANTS.filter.endDate);

        // Verify Row tồn tại
        const expectedCourse = mockFilteredCourse.items[0].courseTitle;
        const row = transPage.getRowByText(expectedCourse);
        await expect(row).toBeVisible();

        // Verify Date Column (Check cột cuối cùng xem có đúng ngày 13/12/2025 không)
        await expect(row.locator('td').last()).toContainText(TEST_CONSTANTS.filter.expectedDateDisplay);
    });

    test('TC05: Xem chi tiết giao dịch hiển thị đúng tiêu đề', async ({ page }) => {
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
            // Mock API để tránh lỗi network console khi redirect
            await page.route('**/Transactions/stats/**', async route =>
                route.fulfill({ json: mockCourseStats })
            );
            await verifyAccessDenied(page, role, TRANSACTIONS_URL);
        });
    }
});