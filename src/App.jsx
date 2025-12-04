import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout & Components
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";

// Các trang chính
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
import AdminTransactions from "./pages/AdminTransactions/AdminTransactions";
import CourseTransactionDetails from "./pages/CourseTransactionDetails/CourseTransactionDetails";
import AdminCategories from "./pages/AdminCategories/AdminCategories";
import AdminUsersPage from "./pages/AdminUsersPage/AdminUsersPage";
import SellerChat from "./pages/Chat/SellerChat";
import PaymentResult from "./pages/PaymentResult";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Trang chủ */}
                <Route index element={<HomePage />} />
                {/* Trang lịch sử xem */}
                <Route path="history" element={<HistoryPage />} />
                {/* Trang chi tiết khóa học */}
                <Route path="course/:id" element={<CourseDetail />} />
                {/* Đăng nhập / đăng ký */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<LoginPage />} />

                {/* Trang khóa học đã mua */}
                <Route
                  path="/purchased"
                  element={
                    <ProtectedRoute showModal={true}>
                      <PurchasedCoursesPage />
                    </ProtectedRoute>
                  }
                />
                {/* Trang quản lý khóa học (Seller) */}
                <Route
                  path="seller-courses"
                  element={
                    <ProtectedRoute>
                      <SellerCoursesPage />
                    </ProtectedRoute>
                  }
                />
                {/* Trang chat của seller */}
                <Route
                  path="seller-chat"
                  element={
                    <ProtectedRoute>
                      <SellerChat />
                    </ProtectedRoute>
                  }
                />
                {/* Trang quản lý khóa học (Admin) */}
                <Route
                  path="admin-courses"
                  element={
                    <ProtectedRoute>
                      <AdminCoursesPage />
                    </ProtectedRoute>
                  }
                />
                {/* Trang quản lý danh mục (Admin) */}
                <Route
                  path="admin-categories"
                  element={
                    <ProtectedRoute>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                {/* Trang quản lý người dùng (Admin) */}
                <Route
                  path="admin-users"
                  element={
                    <ProtectedRoute>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                {/* Trang quản lý giao dịch (Admin) */}
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <AdminTransactions />
                    </ProtectedRoute>
                  }
                />
                {/* Thông tin người dùng */}
                <Route
                  path="user-info"
                  element={
                    <ProtectedRoute>
                      <UserInfo />
                    </ProtectedRoute>
                  }
                />

                {/* Trang yêu thích */}
                <Route
                  path="favorites"
                  element={
                    <ProtectedRoute showModal={true}>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                {/* Giỏ hàng */}
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute showModal={true}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />

                {/* Thêm khóa học mới */}
                <Route
                  path="add-new-course"
                  element={
                    <ProtectedRoute>
                      <AddNewCourse />
                    </ProtectedRoute>
                  }
                />
                {/* Trang chi tiết giao dịch tổng hợp */}
                <Route
                  path="course-transactions/details"
                  element={
                    <ProtectedRoute>
                      <CourseTransactionDetails />
                    </ProtectedRoute>
                  }
                />
                {/* Trang thông báo thanh toán */}
                <Route
                  path="payment-result"
                  element={
                    <ProtectedRoute>
                      <PaymentResult />
                    </ProtectedRoute>
                  }
                />
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
