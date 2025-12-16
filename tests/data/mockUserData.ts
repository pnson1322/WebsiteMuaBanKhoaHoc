// Data/mockUserData.ts

export const mockStats = {
    "totalUsers": 13,
    "roleCounts": {
        "Seller": 5,
        "Buyer": 7, // Số liệu mock
        "Admin": 2
    }
};

export const mockDefaultList = {
    "page": 1,
    "pageSize": 1,
    "totalCount": 13,
    "totalPages": 13,
    "items": [
        {
            "id": 13,
            "fullName": "Nguyễn Văn An",
            "email": "an.nguyen@gmail.com",
            "phoneNumber": "0901234568",
            "role": "Buyer",
            "createdAt": "2025-10-24T07:03:24.509458Z"
        }
    ]
};

export const mockBuyerList = {
    "page": 1,
    "pageSize": 10,
    "totalCount": 6,
    "totalPages": 1,
    "items": [
        {
            "id": 13,
            "fullName": "Nguyễn Văn An",
            "email": "an.nguyen@gmail.com",
            "phoneNumber": "0901234568",
            "role": "Buyer",
            "createdAt": "2025-10-24T07:03:24.509458Z"
        },
        {
            "id": 11,
            "fullName": "Ngô Văn Long",
            "email": "long.ngo@gmail.com",
            "phoneNumber": "0990123456",
            "role": "Buyer",
            "createdAt": "2025-10-14T07:03:24.509458Z"
        },
        {
            "id": 10,
            "fullName": "Đinh Thị Hương",
            "email": "huong.dinh@gmail.com",
            "phoneNumber": "0989012345",
            "role": "Buyer",
            "createdAt": "2025-10-04T07:03:24.509458Z"
        }
    ]
};

export const mockSellerList = {
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    items: [
        {
            id: 21,
            fullName: "Trần Minh Khôi",
            email: "khoi.tran@seller.com",
            phoneNumber: "0912345678",
            role: "Seller",
            createdAt: "2025-10-20T09:15:30.000000Z"
        }
    ]
};

export const mockAdminList = {
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    items: [
        {
            id: 1,
            fullName: "Lê Thị Hồng",
            email: "hong.le@admin.com",
            phoneNumber: "0909876543",
            role: "Admin",
            createdAt: "2025-09-01T08:00:00.000000Z"
        }
    ]
};
