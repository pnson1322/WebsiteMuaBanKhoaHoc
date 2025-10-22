import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppState } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import "./Header.css";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  BookOpen,
  User,
  LogOut,
  List,
  DollarSign,
  Server,
  Users,
} from "lucide-react";
import { useState } from "react";

const Header = ({ onOpenLoginPopup }) => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🔹 Các hàm điều hướng cơ bản
  const handleLogoClick = () => navigate("/");
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (state.searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(state.searchTerm.trim())}`);
    }
  };
  const handleSearchChange = (e) =>
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: e.target.value });
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleInfo = () => navigate("/user-info");
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div
          className="logo"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <BookOpen className="logo-icon" />
          <span className="logo-text">EduMart</span>
        </div>

        {/* Thanh tìm kiếm */}
        <form
          className="search-container desktop-only"
          onSubmit={handleSearchSubmit}
        >
          <Search className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Tìm kiếm khóa học, giáo trình..."
            value={state.searchTerm}
            onChange={handleSearchChange}
          />
        </form>

        {/* Thanh điều hướng */}
        <nav className="nav-icons">
          {/* Quản trị viên */}
          {isLoggedIn && user?.role === "admin" && (
            <>
              <button
                className="nav-button"
                onClick={() => navigate("/admin-courses")}
                title="Khóa học"
              >
                <List className="nav-icon" />
                <span className="nav-label">Khóa học</span>
              </button>
              <button
                className="nav-button"
                onClick={() => navigate("/transactions")}
                title="Giao dịch"
              >
                <DollarSign className="nav-icon" />
                <span className="nav-label">Giao dịch</span>
              </button>
              <button
                className="nav-button"
                onClick={() => navigate("/categories")}
                title="Danh mục"
              >
                <Server className="nav-icon" />
                <span className="nav-label">Danh mục</span>
              </button>
              <button
                className="nav-button"
                onClick={() => navigate("/users")}
                title="Người dùng"
              >
                <Users className="nav-icon" />
                <span className="nav-label">Người dùng</span>
              </button>
            </>
          )}

          {/* Học viên */}
          {(!isLoggedIn || user?.role === "learner") && (
            <>
              <button
                className="nav-button"
                onClick={() => navigate("/learner-courses")}
                title="Khóa học"
              >
                <List className="nav-icon" />
                {state.courses.length > 0 && (
                  <span className="badge">{state.courses.length}</span>
                )}
                <span className="nav-label">Khóa học</span>
              </button>

              <button
                className="nav-button"
                onClick={() => navigate("/favorites")}
                title="Yêu thích"
              >
                <Heart className="nav-icon" />
                {state.favorites.length > 0 && (
                  <span className="badge">{state.favorites.length}</span>
                )}
                <span className="nav-label">Yêu thích</span>
              </button>

              <button
                className="nav-button"
                onClick={() => navigate("/cart")}
                title="Giỏ hàng"
              >
                <ShoppingCart className="nav-icon" />
                {state.cart.length > 0 && (
                  <span className="badge">{state.cart.length}</span>
                )}
                <span className="nav-label">Giỏ hàng</span>
              </button>
            </>
          )}

          {/* User info / Đăng nhập */}
          {isLoggedIn ? (
            <div className="user-menu desktop-only">
              <button className="nav-button user-button" title={user?.name}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar"
                  />
                ) : (
                  <User className="nav-icon" />
                )}
                <span className="nav-label">{user?.name}</span>
              </button>

              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleInfo}>
                  <User className="dropdown-icon" />
                  Thông tin cá nhân
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut className="dropdown-icon" />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <button
              className="nav-button login-button desktop-only"
              onClick={onOpenLoginPopup}
              title="Đăng nhập"
            >
              <User className="nav-icon" />
              <span className="nav-label">Đăng nhập</span>
            </button>
          )}

          {/* Menu di động */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <form className="mobile-search" onSubmit={handleSearchSubmit}>
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={state.searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </form>

            <div className="mobile-user-actions">
              {isLoggedIn ? (
                <div className="mobile-user-info">
                  <div className="mobile-user-profile">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="user-avatar"
                      />
                    ) : (
                      <User className="nav-icon" />
                    )}
                    <span>{user?.name}</span>
                  </div>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <LogOut className="nav-icon" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <button
                    onClick={onOpenLoginPopup}
                    className="mobile-auth-btn"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="mobile-auth-btn secondary"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
