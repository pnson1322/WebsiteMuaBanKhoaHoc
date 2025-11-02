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

const CourseDetail = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h1>📘 Chi tiết khóa học</h1>
    <p>
      Trang này sẽ hiển thị thông tin chi tiết của khóa học (UI trước, API sau).
    </p>
  </div>
);

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

                {/* Trang chi tiết khóa học */}
                <Route path="course/:id" element={<CourseDetail />} />

                {/* Đăng nhập / đăng ký */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<LoginPage />} />

                {/* Thông tin người dùng */}
                <Route path="user-info" element={<UserInfo />} />

                {/* Fallback 404 */}
                <Route
                  path="*"
                  element={
                    <h2 style={{ textAlign: "center", marginTop: "2rem" }}>
                      404 - Không tìm thấy trang
                    </h2>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
