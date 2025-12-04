# Website Mua Bán Khóa Học

Nền tảng thương mại điện tử cho phép người dùng mua bán các khóa học trực tuyến. Website cung cấp đầy đủ các tính năng từ quản lý khóa học, thanh toán, chat real-time đến quản trị hệ thống.

## 🚀 Tính Năng Chính

### Người Dùng

- **Xem & Tìm kiếm khóa học**: Duyệt, lọc và tìm kiếm khóa học theo danh mục, giá, đánh giá
- **Chi tiết khóa học**: Xem thông tin chi tiết, đánh giá, nội dung khóa học
- **Giỏ hàng & Thanh toán**: Thêm khóa học vào giỏ hàng, thanh toán qua MoMo
- **Khóa học đã mua**: Quản lý và truy cập các khóa học đã mua
- **Yêu thích**: Lưu danh sách khóa học yêu thích
- **Lịch sử xem**: Theo dõi các khóa học đã xem
- **Đánh giá**: Đánh giá và nhận xét về khóa học
- **Chat real-time**: Liên hệ trực tiếp với người bán

### Người Bán (Seller)

- **Quản lý khóa học**: Tạo mới, chỉnh sửa, xóa khóa học
- **Theo dõi doanh thu**: Xem thống kê bán hàng và giao dịch
- **Chat với khách hàng**: Trả lời câu hỏi của người mua qua chat real-time
- **Quản lý đánh giá**: Xem và phản hồi đánh giá của học viên

### Quản Trị Viên (Admin)

- **Quản lý người dùng**: Thêm, sửa, xóa, phân quyền người dùng
- **Quản lý danh mục**: CRUD danh mục khóa học
- **Quản lý khóa học**: Duyệt, chỉnh sửa, xóa các khóa học
- **Quản lý giao dịch**: Xem chi tiết giao dịch, theo dõi doanh thu
- **Thống kê & Báo cáo**: Dashboard với biểu đồ thống kê

## 🛠️ Công Nghệ Sử Dụng

### Frontend

- **React 18.2** - Thư viện UI
- **React Router DOM 7.9** - Routing
- **Redux Toolkit 2.9** - State management
- **Vite 7.2** - Build tool & Dev server
- **Axios 1.12** - HTTP client
- **Material-UI (MUI) 7.3** - Component library
- **Styled Components 6.1** - CSS-in-JS
- **SignalR 10.0** - Real-time communication
- **Lucide React** - Icon library
- **Date-fns 4.1** - Date utility
- **SimpleBar React** - Custom scrollbar

### Tích Hợp

- **MoMo Payment Gateway** - Cổng thanh toán
- **SignalR** - Chat real-time & thông báo

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 16.0
- npm hoặc yarn
- Backend API server đang chạy

## 🔧 Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd WebsiteMuaBanKhoaHoc
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Cấu Hình

Tạo file `.env` trong thư mục gốc và cấu hình các biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SIGNALR_HUB_URL=http://localhost:5000/chatHub
```

### 4. Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### 5. Build cho Production

```bash
npm run build
```

### 6. Preview Production Build

```bash
npm run preview
```

## 📁 Cấu Trúc Thư Mục

```
src/
├── app/                    # Redux store configuration
├── assets/                 # Hình ảnh, fonts, static files
├── components/             # React components
│   ├── Auth/              # Đăng nhập, đăng ký
│   ├── Chat/              # Chat real-time
│   ├── CourseCard/        # Card hiển thị khóa học
│   ├── Filter/            # Bộ lọc khóa học
│   ├── AdminCategory/     # Quản lý danh mục (Admin)
│   ├── AdminTransactions/ # Quản lý giao dịch (Admin)
│   ├── AdminUser/         # Quản lý người dùng (Admin)
│   ├── Seller/            # Components cho người bán
│   └── common/            # Shared components
├── contexts/              # React Context providers
│   ├── AuthContext.jsx    # Authentication state
│   ├── AppContext.jsx     # Global app state
│   ├── ChatContext.jsx    # Chat state
│   └── SignalRContext.jsx # SignalR connection
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
│   ├── HomePage/          # Trang chủ
│   ├── CourseDetail/      # Chi tiết khóa học
│   ├── Cart/              # Giỏ hàng
│   ├── AdminUsersPage/    # Quản lý users
│   ├── AdminCoursesPage/  # Quản lý courses
│   └── ...
├── services/              # API services
│   ├── api.js             # API base configuration
│   ├── axiosInstance.js   # Axios setup
│   ├── courseAPI.js       # Course APIs
│   ├── userAPI.js         # User APIs
│   ├── cartAPI.jsx        # Cart APIs
│   ├── momoAPI.js         # Payment APIs
│   └── signalRService.js  # SignalR service
└── utils/                 # Utility functions
```

## 🔑 Quyền Người Dùng

### Roles

- **User**: Người dùng thông thường - mua khóa học
- **Seller**: Người bán - tạo và quản lý khóa học
- **Admin**: Quản trị viên - quản lý toàn bộ hệ thống

### Protected Routes

Các trang yêu cầu đăng nhập được bảo vệ bởi `ProtectedRoute` component:

- `/user-info` - Thông tin cá nhân
- `/favorites` - Danh sách yêu thích
- `/cart` - Giỏ hàng
- `/purchased-courses` - Khóa học đã mua
- `/seller/*` - Trang người bán
- `/admin/*` - Trang quản trị

## 🎨 Features Chi Tiết

### Authentication

- Đăng nhập / Đăng ký
- JWT token authentication
- Auto refresh token
- Protected routes theo role

### Course Management

- Lazy loading với skeleton
- Infinite scroll
- Filter & search
- Sort by price, rating, date
- Category filtering

### Shopping Cart

- Thêm/xóa khóa học
- Cập nhật số lượng
- Tính tổng tiền tự động
- Persist cart trong localStorage

### Payment

- Tích hợp MoMo QR Code
- Payment result callback
- Transaction history
- Receipt generation

### Real-time Features

- Chat giữa buyer và seller
- Notification popup
- SignalR connection management
- Online/offline status

### Admin Dashboard

- User statistics
- Course statistics
- Revenue charts
- Transaction management
- Category CRUD

## 🔌 API Integration

### Base Configuration

```javascript
// axiosInstance.js
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### API Services

- `courseAPI.js` - Courses CRUD
- `userAPI.js` - User management
- `cartAPI.jsx` - Shopping cart
- `favoriteAPI.js` - Favorites
- `reviewAPI.js` - Reviews & ratings
- `transactionAPI.js` - Payment transactions
- `chatAPI.js` - Chat messages
- `notificationAPI.js` - Notifications

## 🎯 State Management

### Redux Toolkit

- User slice
- Course slice
- Cart slice
- Category slice

### Context API

- `AuthContext` - Authentication state
- `AppContext` - Global app state
- `ChatContext` - Chat state
- `ToastContext` - Toast notifications

## 🐛 Debug & Logging

Sử dụng `logger.js` utility để debug:

```javascript
import logger from "./utils/logger";

logger.info("Info message");
logger.error("Error message");
logger.warn("Warning message");
```

## 📱 Responsive Design

Website được thiết kế responsive cho các thiết bị:

- Desktop (>1024px)
- Tablet (768px - 1024px)
- Mobile (<768px)

## 🔐 Security

- JWT token authentication
- Protected routes
- CORS configuration
- Input validation
- XSS protection

## 🚦 Performance Optimization

- Code splitting
- Lazy loading components
- Image optimization
- Debounced search
- Memoization với React.memo
- Virtual scrolling

## 📄 License

Copyright © 2025. All rights reserved.

## 👥 Thành Viên Dự Án

### Frontend Team

- **Đinh Phan Quốc Thắng** - Frontend Developer
- **Phan Ngọc Sơn** - Frontend Developer

### Backend Team

- **Trương Ngọc Sang** - Backend Developer
- **Đình Huy** - Backend Developer

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng tạo pull request hoặc mở issue.

## 📞 Liên Hệ

Nếu có câu hỏi hoặc vấn đề, vui lòng liên hệ qua:

- GitHub Issues: [[Link to issues](https://github.com/QuocThang1302)]
- Email: [23521420@gm.uit.edu.vn]

---

**Lưu ý**: Đây là phiên bản frontend, cần backend API server để chạy đầy đủ các tính năng.
