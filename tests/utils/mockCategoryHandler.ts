// utils/mockCategoryHandler.ts
import { Page } from '@playwright/test';
import { INITIAL_CATEGORIES } from '../data/mockCategoryData';

export async function setupCategoryMock(page: Page) {
    let mockDB = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));

    // Pattern vẫn giữ nguyên hoặc thêm /api/ nếu có thể
    await page.route('**/Category*', async route => {
        const request = route.request();
        const method = request.method();
        const url = request.url();
        const resourceType = request.resourceType();

        // 🛡️ GUARD: QUAN TRỌNG NHẤT
        // Chỉ xử lý nếu đây là request API (fetch/xhr).
        // Nếu là script, stylesheet, image... có tên chứa "Category" thì bỏ qua cho nó đi tiếp.
        if (!['fetch', 'xhr'].includes(resourceType)) {
            await route.continue();
            return;
        }

        // --- Log để debug xem nó đang bắt request nào ---
        // console.log(`Mocking: ${method} ${url}`);

        // --- GET: Lấy danh sách ---
        if (method === 'GET' && !url.match(/\/Category\/\d+/)) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockDB)
            });
            return;
        }

        // --- POST: Thêm mới ---
        if (method === 'POST') {
            const postData = request.postDataJSON(); // Sửa lại route.request() thành request biến đã khai báo

            // Check trùng tên
            if (mockDB.some((cat: any) => cat.name === postData.name)) {
                await route.fulfill({
                    status: 400,
                    body: JSON.stringify({ message: "Category name already exists" })
                });
                return;
            }

            const newCat = {
                id: mockDB.length + 100 + Math.floor(Math.random() * 1000),
                name: postData.name,
                createdAt: new Date().toISOString()
            };
            mockDB.push(newCat);

            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify(newCat)
            });
            return;
        }

        // --- PUT: Cập nhật ---
        if (method === 'PUT') {
            const putData = request.postDataJSON();
            if (putData.id) {
                const index = mockDB.findIndex((c: any) => c.id === putData.id);
                if (index !== -1) mockDB[index].name = putData.name;
            }
            await route.fulfill({ status: 204 });
            return;
        }

        // --- DELETE: Xóa ---
        if (method === 'DELETE') {
            const idMatch = url.match(/\/Category\/(\d+)/);
            if (idMatch) {
                const idToDelete = parseInt(idMatch[1]);

                if (idToDelete === 1) {
                    await route.fulfill({
                        status: 403,
                        body: JSON.stringify({ message: "Cannot delete default category" })
                    });
                    return;
                }

                mockDB = mockDB.filter((c: any) => c.id !== idToDelete);
                await route.fulfill({ status: 204 });
            }
            return;
        }

        // Fallback: Nếu không khớp logic nào ở trên (ví dụ OPTIONS preflight), cho đi tiếp
        await route.continue();
    });
}