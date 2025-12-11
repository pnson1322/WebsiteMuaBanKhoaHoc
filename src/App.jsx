import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout & Components
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Context Providers
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";
import { UnreadCountProvider } from "./contexts/UnreadCountContext";

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

const AppContent = () => {
  const { user, accessToken, token } = useAuth();
  const finalToken = accessToken || token;
  const userId = user?.id || user?.Id;
  console.log("AppContent Render:", { user, finalToken });

  return (
    <UnreadCountProvider userId={userId} authToken={finalToken}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* --- PUBLIC ROUTES --- */}
            <Route index element={<HomePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="course/:id" element={<CourseDetail />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<LoginPage />} />

            <Route
              path="/purchased"
              element={
                <ProtectedRoute showModal={true}>
                  <PurchasedCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="user-info"
              element={
                <ProtectedRoute>
                  <UserInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="favorites"
              element={
                <ProtectedRoute showModal={true} allowedRoles={["Buyer"]}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="cart"
              element={
                <ProtectedRoute showModal={true} allowedRoles={["Buyer"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="course-transactions/details"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <CourseTransactionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment-result"
              element={
                <ProtectedRoute allowedRoles={["Buyer"]}>
                  <PaymentResult />
                </ProtectedRoute>
              }
            />

            <Route
              path="seller-courses"
              element={
                <ProtectedRoute allowedRoles={["Seller"]}>
                  <SellerCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="seller-chat"
              element={
                <ProtectedRoute allowedRoles={["Seller"]}>
                  <SellerChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-new-course"
              element={
                <ProtectedRoute allowedRoles={["Seller"]}>
                  <AddNewCourse />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin-courses"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-categories"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-users"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminTransactions />
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
    </UnreadCountProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
