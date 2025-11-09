import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🧩 Layout & Components
import { Layout } from "./components/Layout";
// 🧠 Context Providers (đã có sẵn trong dự án bạn)
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";

// 📄 Các trang chính
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage";
import UserInfo from "./pages/UserInfo";
import Favorites from "./pages/Favorites";
import HistoryPage from "./pages/HistoryPage/HistoryPage";
import CourseDetail from "./pages/CourseDetail";
import Cart from "./pages/Cart";
import AddNewCourse from "./pages/AddNewCourse";
import PurchasedCoursesPage from "./pages/PurchasedCoursesPage/PurchasedCoursesPage";
import SellerCoursesPage from "./pages/SellerCoursesPage/SellerCoursesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage/AdminCoursesPage";
import AdminTransactions from "./pages/AdminTransactionsPage/AdminTransactions";
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Trang chủ */}
                <Route index element={<HomePage />} />
                {/* Trang lịch sử xem */}
                <Route path="history" element={<HistoryPage />} />
                {/* Trang khóa học đã mua */}
                <Route path="/purchased" element={<PurchasedCoursesPage />} />
                {/* Trang quản lý khóa học (Seller) */}
                <Route path="seller-courses" element={<SellerCoursesPage />} />
                {/* Trang quản lý khóa học (Admin) */}
                <Route path="admin-courses" element={<AdminCoursesPage />} />
                {/* Trang chi tiết khóa học */}
                <Route path="course/:id" element={<CourseDetail />} />
                <Route path="/transactions" element={<AdminTransactions />} />
                {/* Đăng nhập / đăng ký */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<LoginPage />} />

                {/* Thông tin người dùng */}
                <Route path="user-info" element={<UserInfo />} />

                {/* Trang yêu thích */}
                <Route path="favorites" element={<Favorites />} />

                {/* Giỏ hàng */}
                <Route path="cart" element={<Cart />} />

                {/* Thêm khóa học mới */}
                <Route path="add-new-course" element={<AddNewCourse />} />
              </Route>

              {/* Fallback 404 */}
              <Route
                path="*"
                element={
                  <h2 style={{ textAlign: "center", marginTop: "2rem" }}>
                    404 - Không tìm thấy trang
                  </h2>
                }
              />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
