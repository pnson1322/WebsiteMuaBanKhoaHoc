import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";
import Footer from "./Footer";
import LoginPopup from "./Auth/LoginPopup";

export const Layout = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  return (
    <div className="app">
      <Header
        onOpenLoginPopup={() => setShowLoginPopup(true)}
      />

      <main className="main-content">
        <Outlet />
      </main>

      {/* ✅ Hiển thị popup đăng nhập */}
      {showLoginPopup && (
        <LoginPopup onClose={() => setShowLoginPopup(false)} />
      )}
      {/* Chatbox */}

      <Footer />
    </div>
  );
};
