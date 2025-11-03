// ✅ Mock API service cho khóa học (chạy được mà không cần backend)

// ---------------------- MOCK DATA ----------------------
const mockCourses = [
  {
    id: 1,
    name: "React từ cơ bản đến nâng cao",
    shortDescription: "Học React từ A-Z với dự án thực tế",
    instructor: "Nguyễn Văn A",
    price: 599000,
    image:
      "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/571104562_1236012621904810_8318776170876559608_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=jF39-UQOIhoQ7kNvwHtoceb&_nc_oc=AdlDJkRevqvtgruO4S3JuqCfmLod38iwBnIxlq8NltKxsxs6RTR2ueuFleG6GqWc75Y0O4EX5jgRTGzrHYSXSM7B&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=NPPDH5TB3ZgXCj6ppXgKcg&oh=00_Afc0gns-8Rs1OMriBrYwwXO8m988wlfnnCaiRZvOW4uM4w&oe=6905895B", // code theme
    category: "Lập trình",
    rating: 4.8,
    students: 1250,
    level: "Trung cấp",
  },
  {
    id: 2,
    name: "UI/UX Design cơ bản",
    shortDescription: "Thiết kế giao diện người dùng chuyên nghiệp với Figma",
    instructor: "Trần Thị B",
    price: 799000,
    image: "https://picsum.photos/id/1005/400/250", // design theme
    category: "Thiết kế",
    rating: 4.6,
    students: 890,
    level: "Cơ bản",
  },
  {
    id: 3,
    name: "Tiếng Anh giao tiếp",
    shortDescription: "Luyện nói tiếng Anh tự tin trong 30 ngày",
    instructor: "John Smith",
    price: 299000,
    image: "https://picsum.photos/id/1027/400/250", // language theme
    category: "Ngoại ngữ",
    rating: 4.9,
    students: 2100,
    level: "Cơ bản",
  },
  {
    id: 4,
    name: "Digital Marketing 2024",
    shortDescription: "Chiến lược marketing hiệu quả cho doanh nghiệp hiện đại",
    instructor: "Lê Văn C",
    price: 999000,
    image: "https://picsum.photos/id/1015/400/250", // marketing theme
    category: "Marketing",
    rating: 4.7,
    students: 1560,
    level: "Trung cấp",
  },
  {
    id: 5,
    name: "JavaScript ES6+",
    shortDescription:
      "Cập nhật kiến thức JavaScript hiện đại, async/await và module",
    instructor: "Phạm Thị D",
    price: 449000,
    image: "https://picsum.photos/id/1016/400/250", // coding theme
    category: "Lập trình",
    rating: 4.5,
    students: 980,
    level: "Cơ bản",
  },
  {
    id: 6,
    name: "Photoshop cho người mới bắt đầu",
    shortDescription:
      "Học chỉnh sửa ảnh chuyên nghiệp và thiết kế banner quảng cáo",
    instructor: "Hoàng Văn E",
    price: 349000,
    image: "https://picsum.photos/id/1037/400/250", // creative theme
    category: "Thiết kế",
    rating: 4.4,
    students: 750,
    level: "Cơ bản",
  },
  {
    id: 7,
    name: "Python cho người mới bắt đầu",
    shortDescription: "Học Python căn bản qua ví dụ thực tế và mini project",
    instructor: "Nguyễn Hoàng F",
    price: 550000,
    image: "https://picsum.photos/id/1050/400/250", // code theme
    category: "Lập trình",
    rating: 4.7,
    students: 1650,
    level: "Cơ bản",
  },
  {
    id: 8,
    name: "SEO & Google Ads toàn diện",
    shortDescription: "Nắm vững SEO và quảng cáo Google để tăng doanh thu",
    instructor: "Phạm Đức G",
    price: 899000,
    image: "https://picsum.photos/id/1044/400/250", // marketing theme
    category: "Marketing",
    rating: 4.8,
    students: 1420,
    level: "Trung cấp",
  },
  {
    id: 9,
    name: "Thiết kế thương hiệu với Illustrator",
    shortDescription:
      "Tạo logo và bộ nhận diện thương hiệu với Adobe Illustrator",
    instructor: "Trần Mai H",
    price: 650000,
    image: "https://picsum.photos/id/1062/400/250", // design theme
    category: "Thiết kế",
    rating: 4.6,
    students: 860,
    level: "Trung cấp",
  },
  {
    id: 10,
    name: "Phân tích dữ liệu với Excel nâng cao",
    shortDescription:
      "Sử dụng hàm, Pivot Table và biểu đồ nâng cao trong Excel",
    instructor: "Lưu Thành I",
    price: 490000,
    image: "https://picsum.photos/id/1074/400/250", // business/data theme
    category: "Marketing",
    rating: 4.5,
    students: 970,
    level: "Nâng cao",
  },
];

// ---------------------- UTILITY ----------------------
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------- MOCK API ----------------------
export const coursesAPI = {
  // 🔹 Lấy danh sách khóa học có phân trang
  async getCoursesWithPagination(page = 1, limit = 12) {
    await delay(400);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const courses = mockCourses.slice(startIndex, endIndex);

    return {
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(mockCourses.length / limit),
        hasMore: endIndex < mockCourses.length,
        total: mockCourses.length,
      },
    };
  },

  // 🔹 Lấy chi tiết 1 khóa học theo ID
  async getCourseById(id) {
    await delay(300);
    const course = mockCourses.find((c) => c.id === parseInt(id));
    if (!course) throw new Error("❌ Course not found");
    return course;
  },

  // 🔹 Tìm kiếm + Lọc khóa học
  async searchCourses(query = "", filters = {}) {
    await delay(400);
    let results = [...mockCourses];

    if (query) {
      results = results.filter(
        (course) =>
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.shortDescription.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.category && filters.category !== "Tất cả") {
      results = results.filter((c) => c.category === filters.category);
    }

    if (filters.priceRange && filters.priceRange.label !== "Tất cả") {
      results = results.filter(
        (c) =>
          c.price >= filters.priceRange.min && c.price <= filters.priceRange.max
      );
    }

    return results;
  },

  // 🔹 Lấy toàn bộ khóa học (dùng khi khởi động app)
  async getAllCourses() {
    await delay(300);
    return mockCourses;
  },
};
