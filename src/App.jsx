import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Layout chính */}
              <Route path="/" element={<Layout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<LoginPage />} />
              </Route>

              {/* Route fallback */}
              <Route
                path="*"
                element={
                  <h2 style={{ textAlign: "center" }}>
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
