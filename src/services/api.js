// ✅ Mock API service cho khóa học (chạy được mà không cần backend)

// ---------------------- MOCK DATA ----------------------
const mockCourses = [
  {
    id: 1,
    name: "React từ cơ bản đến nâng cao",
    description:
      "Khóa học giúp bạn làm chủ ReactJS từ nền tảng đến các kỹ thuật nâng cao, kết hợp dự án thực tế và các thư viện phổ biến như React Router, Redux, Zustand.",
    image:
      "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/571104562_1236012621904810_8318776170876559608_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=jF39-UQOIhoQ7kNvwHtoceb&_nc_oc=AdlDJkRevqvtgruO4S3JuqCfmLod38iwBnIxlq8NltKxsxs6RTR2ueuFleG6GqWc75Y0O4EX5jgRTGzrHYSXSM7B&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=NPPDH5TB3ZgXCj6ppXgKcg&oh=00_Afc0gns-8Rs1OMriBrYwwXO8m988wlfnnCaiRZvOW4uM4w&oe=6905895B",
    category: "Lập trình",
    instructor: {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@uit.edu.vn",
      phone: "+84 937 512 300",
    },
    rating: "4.8",
    students: 1250,
    duration: "42 giờ",
    level: "Trung cấp",
    price: 599000,
    contentList: [
      { title: "React cơ bản", des: "Hiểu component, props, state, và JSX." },
      { title: "React nâng cao", des: "Hooks, Context API, Redux, Routing." },
      {
        title: "Dự án thực tế",
        des: "Xây dựng website học trực tuyến với React và RESTful API.",
      },
    ],
    intendedLearners: [
      "Người mới muốn học React từ đầu",
      "Frontend Developer muốn nâng cao kỹ năng",
      "Sinh viên CNTT muốn có dự án thực tế",
    ],
    skillsAcquired: [
      "ReactJS hiện đại",
      "Redux / Zustand",
      "Routing & Hooks",
      "API Integration",
      "Tối ưu hiệu năng",
    ],
    commentList: [
      {
        id: 1,
        user: {
          id: 1,
          name: "Trương Ngọc Sang",
          image: "https://picsum.photos/id/1011/100/100",
        },
        date: "15/3/2024",
        comment:
          "Khóa học rất dễ hiểu, ví dụ sát thực tế. Giảng viên nhiệt tình.",
        rate: 5,
      },
    ],
  },
  {
    id: 2,
    name: "UI/UX Design cơ bản",
    description:
      "Khóa học giúp bạn nắm vững quy trình thiết kế giao diện và trải nghiệm người dùng với Figma, thực hành qua dự án thực tế.",
    image: "https://picsum.photos/id/1005/400/250",
    category: "Thiết kế",
    instructor: {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@designacademy.vn",
      phone: "+84 938 567 123",
    },
    rating: "4.6",
    students: 890,
    duration: "28 giờ",
    level: "Cơ bản",
    price: 799000,
    contentList: [
      { title: "Giới thiệu UI/UX", des: "Khái niệm, vai trò và quy trình." },
      { title: "Làm quen Figma", des: "Tạo layout, component, prototype." },
      {
        title: "Dự án thiết kế",
        des: "Thiết kế giao diện thực tế và portfolio.",
      },
    ],
    intendedLearners: [
      "Người mới học thiết kế",
      "Sinh viên CNTT hoặc Đồ họa",
      "Người muốn chuyển nghề sang UI/UX",
    ],
    skillsAcquired: [
      "Thiết kế UI",
      "Phân tích UX",
      "Dựng prototype",
      "Tư duy thiết kế",
    ],
    commentList: [
      {
        id: 1,
        user: {
          id: 3,
          name: "Phạm Minh Khang",
          image: "https://picsum.photos/id/1012/100/100",
        },
        date: "18/3/2024",
        comment:
          "Giảng viên dạy chi tiết, dễ hiểu. Thực hành nhiều trên Figma.",
        rate: 5,
      },
    ],
  },
  {
    id: 3,
    name: "Tiếng Anh giao tiếp",
    description:
      "Luyện nói tiếng Anh tự tin qua tình huống thực tế, tập trung phát âm và phản xạ nhanh.",
    image: "https://picsum.photos/id/1027/400/250",
    category: "Ngoại ngữ",
    instructor: {
      id: 3,
      name: "John Smith",
      email: "johnsmith@englishzone.com",
      phone: "+1 202 333 4567",
    },
    rating: "4.9",
    students: 2100,
    duration: "30 giờ",
    level: "Cơ bản",
    price: 299000,
    contentList: [
      { title: "Phát âm chuẩn", des: "Luyện âm, trọng âm và ngữ điệu." },
      {
        title: "Tình huống giao tiếp",
        des: "Thực hành qua hội thoại hàng ngày.",
      },
      { title: "Nghe – nói phản xạ", des: "Tăng phản xạ tiếng Anh tự nhiên." },
    ],
    intendedLearners: [
      "Người mất gốc tiếng Anh",
      "Sinh viên, nhân viên văn phòng",
      "Người chuẩn bị du học hoặc làm việc quốc tế",
    ],
    skillsAcquired: ["Phát âm chuẩn", "Phản xạ nhanh", "Tự tin giao tiếp"],
    commentList: [
      {
        id: 1,
        user: {
          id: 4,
          name: "Nguyễn Thị Kim",
          image: "https://picsum.photos/id/1032/100/100",
        },
        date: "12/4/2024",
        comment:
          "Thầy John dạy rất vui, nói chuyện tự nhiên. Mình cải thiện rõ rệt.",
        rate: 5,
      },
    ],
  },
  {
    id: 4,
    name: "Digital Marketing 2024",
    description:
      "Khóa học tổng hợp kiến thức và chiến lược Marketing hiện đại, bao gồm SEO, Google Ads, Facebook Ads và Content Marketing.",
    image: "https://picsum.photos/id/1015/400/250",
    category: "Marketing",
    instructor: {
      id: 4,
      name: "Lê Văn C",
      email: "levanc@marketingpro.vn",
      phone: "+84 912 879 554",
    },
    rating: "4.7",
    students: 1560,
    duration: "40 giờ",
    level: "Trung cấp",
    price: 999000,
    contentList: [
      { title: "Tổng quan Marketing", des: "Nguyên lý và xu hướng 2024." },
      { title: "Chiến dịch Digital", des: "Lên kế hoạch, tối ưu ngân sách." },
      {
        title: "Thực hành quảng cáo",
        des: "Chạy Ads Google, Facebook, TikTok.",
      },
    ],
    intendedLearners: [
      "Người làm kinh doanh",
      "Chủ shop online",
      "Nhân viên marketing muốn nâng cao kỹ năng",
    ],
    skillsAcquired: ["SEO", "Google Ads", "Social Ads", "Content Strategy"],
    commentList: [
      {
        id: 1,
        user: {
          id: 5,
          name: "Phan Ngọc Sơn",
          image: "https://picsum.photos/id/1019/100/100",
        },
        date: "20/5/2024",
        comment:
          "Thực tế, dễ hiểu. Mình đã áp dụng ngay vào dự án của công ty.",
        rate: 5,
      },
    ],
  },
  {
    id: 5,
    name: "JavaScript ES6+",
    description:
      "Cập nhật kiến thức JavaScript hiện đại, async/await, destructuring, modules, arrow function, class, và promise.",
    image: "https://picsum.photos/id/1016/400/250",
    category: "Lập trình",
    instructor: {
      id: 5,
      name: "Phạm Thị D",
      email: "phamd@devcourse.vn",
      phone: "+84 913 221 666",
    },
    rating: "4.5",
    students: 980,
    duration: "26 giờ",
    level: "Cơ bản",
    price: 449000,
    contentList: [
      {
        title: "ES6 Overview",
        des: "Arrow Function, let/const, Template String.",
      },
      { title: "Async JS", des: "Promise, async/await, callback." },
      { title: "Thực hành project", des: "Ứng dụng todo list và API call." },
    ],
    intendedLearners: ["Lập trình viên mới", "Người học React / Node.js"],
    skillsAcquired: ["ES6 Syntax", "Async Programming", "Debug JS"],
    commentList: [
      {
        id: 1,
        user: {
          id: 6,
          name: "Nguyễn Đình Huy",
          image: "https://picsum.photos/id/1021/100/100",
        },
        date: "10/6/2024",
        comment: "Rất hữu ích cho người học React. Giảng viên dạy dễ hiểu.",
        rate: 5,
      },
    ],
  },
  {
    id: 6,
    name: "Photoshop cho người mới bắt đầu",
    description:
      "Khóa học giúp bạn làm chủ Photoshop, từ công cụ cơ bản đến thiết kế banner, chỉnh ảnh chuyên nghiệp.",
    image: "https://picsum.photos/id/1037/400/250",
    category: "Thiết kế",
    instructor: {
      id: 6,
      name: "Hoàng Văn E",
      email: "hoange@photoschool.vn",
      phone: "+84 934 778 890",
    },
    rating: "4.4",
    students: 750,
    duration: "32 giờ",
    level: "Cơ bản",
    price: 349000,
    contentList: [
      { title: "Công cụ cơ bản", des: "Brush, Selection, Layers, Adjustment." },
      { title: "Thiết kế banner", des: "Tạo banner quảng cáo chuyên nghiệp." },
      { title: "Retouch ảnh", des: "Chỉnh màu, làm đẹp ảnh chuyên sâu." },
    ],
    intendedLearners: [
      "Người muốn học chỉnh ảnh",
      "Sinh viên đồ họa",
      "Freelancer thiết kế banner",
    ],
    skillsAcquired: ["Photoshop cơ bản", "Chỉnh sửa ảnh", "Thiết kế quảng cáo"],
    commentList: [],
  },
  {
    id: 7,
    name: "Python cho người mới bắt đầu",
    description:
      "Khóa học giới thiệu Python cơ bản qua ví dụ thực tế, giúp bạn tự tin xây dựng mini project đầu tiên.",
    image: "https://picsum.photos/id/1050/400/250",
    category: "Lập trình",
    instructor: {
      id: 7,
      name: "Nguyễn Hoàng F",
      email: "hoangf@python.vn",
      phone: "+84 936 220 110",
    },
    rating: "4.7",
    students: 1650,
    duration: "35 giờ",
    level: "Cơ bản",
    price: 550000,
    contentList: [
      { title: "Cú pháp cơ bản", des: "Biến, kiểu dữ liệu, hàm, vòng lặp." },
      { title: "Thực hành mini project", des: "Xây dựng game, tool nhỏ." },
      { title: "Ứng dụng Python", des: "Phân tích dữ liệu và tự động hóa." },
    ],
    intendedLearners: [
      "Người mới học lập trình",
      "Học sinh, sinh viên yêu thích công nghệ",
    ],
    skillsAcquired: ["Python cơ bản", "Logic lập trình", "Project mini"],
    commentList: [],
  },
  {
    id: 8,
    name: "SEO & Google Ads toàn diện",
    description:
      "Khóa học hướng dẫn tối ưu website và quảng cáo Google để tăng doanh thu hiệu quả.",
    image: "https://picsum.photos/id/1044/400/250",
    category: "Marketing",
    instructor: {
      id: 8,
      name: "Phạm Đức G",
      email: "ducg@seomaster.vn",
      phone: "+84 931 411 567",
    },
    rating: "4.8",
    students: 1420,
    duration: "36 giờ",
    level: "Trung cấp",
    price: 899000,
    contentList: [
      { title: "SEO cơ bản", des: "On-page, off-page, keyword research." },
      { title: "Google Ads", des: "Tạo chiến dịch, tối ưu ngân sách." },
      { title: "Phân tích hiệu quả", des: "Theo dõi bằng Google Analytics." },
    ],
    intendedLearners: [
      "Chủ doanh nghiệp nhỏ",
      "Người làm marketing",
      "Freelancer SEO/Ads",
    ],
    skillsAcquired: ["SEO", "Google Ads", "Analytics"],
    commentList: [],
  },
  {
    id: 9,
    name: "Thiết kế thương hiệu với Illustrator",
    description:
      "Học cách tạo logo và bộ nhận diện thương hiệu chuyên nghiệp bằng Adobe Illustrator.",
    image: "https://picsum.photos/id/1062/400/250",
    category: "Thiết kế",
    instructor: {
      id: 9,
      name: "Trần Mai H",
      email: "maih@branddesign.vn",
      phone: "+84 937 888 224",
    },
    rating: "4.6",
    students: 860,
    duration: "34 giờ",
    level: "Trung cấp",
    price: 650000,
    contentList: [
      {
        title: "Công cụ Illustrator",
        des: "Làm chủ các công cụ thiết kế vector.",
      },
      { title: "Thiết kế logo", des: "Tạo biểu tượng nhận diện thương hiệu." },
      { title: "Bộ nhận diện", des: "Hoàn thiện bộ branding hoàn chỉnh." },
    ],
    intendedLearners: [
      "Sinh viên thiết kế",
      "Người muốn học làm logo chuyên nghiệp",
    ],
    skillsAcquired: ["Illustrator", "Logo Design", "Brand Identity"],
    commentList: [],
  },
  {
    id: 10,
    name: "Phân tích dữ liệu với Excel nâng cao",
    description:
      "Nâng cao kỹ năng Excel với hàm, Pivot Table, Dashboard và biểu đồ động phục vụ công việc thực tế.",
    image: "https://picsum.photos/id/1074/400/250",
    category: "Marketing",
    instructor: {
      id: 10,
      name: "Lưu Thành I",
      email: "thanhi@excelskill.vn",
      phone: "+84 932 110 555",
    },
    rating: "4.5",
    students: 970,
    duration: "30 giờ",
    level: "Nâng cao",
    price: 490000,
    contentList: [
      { title: "Excel nâng cao", des: "Hàm thống kê, điều kiện, mảng." },
      {
        title: "Pivot Table",
        des: "Tổng hợp và phân tích dữ liệu nhanh chóng.",
      },
      { title: "Dashboard", des: "Thiết kế báo cáo động, chuyên nghiệp." },
    ],
    intendedLearners: [
      "Nhân viên văn phòng",
      "Kế toán, tài chính",
      "Người làm data entry",
    ],
    skillsAcquired: ["Excel nâng cao", "Pivot Table", "Dashboard"],
    commentList: [],
  },
];

// ---------------------- MOCK PURCHASED COURSES ----------------------
const mockPurchasedCourses = [
  { ...mockCourses[0], purchaseDate: "2025-10-10" },
  { ...mockCourses[2], purchaseDate: "2025-10-15" },
  { ...mockCourses[5], purchaseDate: "2025-10-18" },
  { ...mockCourses[7], purchaseDate: "2025-10-20" },
  { ...mockCourses[8], purchaseDate: "2025-10-22" },
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

  // 🔹 Lấy toàn bộ khóa học
  async getAllCourses() {
    await delay(300);
    return mockCourses;
  },

  // 🔹 Lấy danh sách khóa học đã mua (mock)
  async getPurchasedCourses() {
    await delay(500);
    return mockPurchasedCourses;
  },
};
// ---------------------- MOCK TRANSACTIONS (AUTO-GENERATED) ----------------------

// 🔧 Hàm tạo thời gian ngẫu nhiên gần đây
function randomDateWithinDays(days) {
  const now = new Date();
  const offset = Math.floor(Math.random() * days); // số ngày ngẫu nhiên
  const randomTime = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
  const hour = Math.floor(Math.random() * 12 + 8); // giờ từ 8h-20h
  const minute = Math.floor(Math.random() * 60);
  return `${randomTime.getFullYear()}-${String(
    randomTime.getMonth() + 1
  ).padStart(2, "0")}-${String(randomTime.getDate()).padStart(2, "0")} ${String(
    hour
  ).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// 🔧 Sinh dữ liệu theo khóa học
const mockTransactionsByCourse = mockCourses.map((c, i) => {
  const totalPurchases = Math.floor(Math.random() * 50 + 20); // 20–70 lượt
  const revenue = c.price * totalPurchases;
  const lastTransaction = randomDateWithinDays(30); // trong 30 ngày gần nhất
  return {
    id: `COURSE${String(i + 1).padStart(3, "0")}`,
    name: c.name,
    totalPurchases,
    revenue,
    lastTransaction,
  };
});

// 🔧 Sinh dữ liệu theo học viên (6 học viên nổi bật)
const studentNames = [
  "Trương Ngọc Sang",
  "Phan Ngọc Sơn",
  "Nguyễn Đình Huy",
  "Đinh Phan Quốc Thắng",
  "Trương Ngọc Thắng",
  "Phan Ngọc Huy",
  "Đinh Phan Quốc Sang",
  "Nguyễn Đình Sơn",
];

const mockTransactionsByStudent = studentNames.map((name, i) => {
  const totalPurchases = Math.floor(Math.random() * 40 + 10); // 10–50 khóa học
  const revenue = totalPurchases * Math.floor(Math.random() * 700000 + 300000); // 300k–1tr mỗi khóa
  const lastTransaction = randomDateWithinDays(20);
  return {
    id: i + 1,
    name,
    totalPurchases,
    revenue,
    lastTransaction,
  };
});

// ---------------------- MOCK API: ADMIN ----------------------
export const adminAPI = {
  // 🔹 Lấy danh sách giao dịch theo khóa học
  async getTransactionsByCourse() {
    await delay(400);
    return mockTransactionsByCourse.sort(
      (a, b) => new Date(b.lastTransaction) - new Date(a.lastTransaction)
    );
  },

  // 🔹 Lấy danh sách giao dịch theo học viên
  async getTransactionsByStudent() {
    await delay(400);
    return mockTransactionsByStudent.sort(
      (a, b) => new Date(b.lastTransaction) - new Date(a.lastTransaction)
    );
  },
};
