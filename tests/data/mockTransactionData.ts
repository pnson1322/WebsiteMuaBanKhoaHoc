// tests/data/mockTransactionData.ts

// --- 1. HẰNG SỐ DÙNG CHO TEST (INPUT & EXPECTED LABELS) ---
export const TEST_CONSTANTS = {
    labels: {
        tabCourse: 'TÌM KIẾM KHÓA HỌC',
        tabStudent: 'TÌM KIẾM HỌC VIÊN',
        detailHeader: /Thông Tin Giao Dịch/ // Regex cho linh hoạt
    },
    search: {
        courseKeyword: 'Marketing',
        studentKeyword: 'An'
    },
    filter: {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        // Text ngày tháng mong đợi hiển thị trên UI (khớp với item được lọc)
        expectedDateDisplay: '13/12/2025'
    },
    uiFormat: {
        // Text hiển thị tiền tệ mong đợi (Backend trả về số, UI format thành chuỗi)
        studentRevenueStr: '15.400.000',
        courseRevenueStr: '7.700.000'
    }
};

// --- 2. MOCK API RESPONSES (BACKEND TRẢ VỀ) ---

// API: /Transactions/stats/courses (Mặc định)
export const mockCourseStats = {
    page: 1,
    pageSize: 10,
    totalCount: 20,
    items: [
        {
            courseId: 5,
            courseTitle: "Marketing trên Facebook & Instagram",
            purchaseCount: 7,
            totalRevenue: 7700000,
            lastTransactionDate: "2025-12-13T18:34:24"
        },
        {
            courseId: 3,
            courseTitle: "Flutter - Xây dựng ứng dụng di động",
            purchaseCount: 4,
            totalRevenue: 7200000,
            lastTransactionDate: "2025-12-13T18:14:32"
        }
    ]
};

// API: /Transactions/stats/students (Khi chuyển tab)
export const mockStudentStats = {
    page: 1,
    pageSize: 10,
    totalCount: 15,
    items: [
        {
            studentId: 13,
            fullName: "Nguyễn Văn An",
            purchaseCount: 6,
            totalRevenue: 15400000,
            lastTransactionDate: "2025-12-13T22:05:35"
        },
        {
            studentId: 20,
            fullName: "Trần Thị B",
            purchaseCount: 2,
            totalRevenue: 1200000,
            lastTransactionDate: "2025-10-10T09:00:00"
        }
    ]
};

// --- 3. MOCK RESPONSES ĐÃ LỌC (FILTERED) ---
// Giả lập kết quả trả về khi search đúng keyword

export const mockFilteredCourse = {
    ...mockCourseStats,
    totalCount: 1,
    items: [mockCourseStats.items[0]] // Chỉ lấy ông Marketing
};

export const mockFilteredStudent = {
    ...mockStudentStats,
    totalCount: 1,
    items: [mockStudentStats.items[0]] // Chỉ lấy ông An
};