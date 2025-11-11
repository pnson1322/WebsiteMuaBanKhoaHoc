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
  BellRing,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationPopup from "./NotificationPopup";

const initialNotifications = [
  {
    id: 1,
    text: 'Đinh Sang Sơn đã mua khóa học "Kỹ Năng Bán Hàng Online" với giá 100.000đ',
    time: "Vừa xong",
    isRead: true, // Đã đọc
  },
  {
    id: 2,
    text: 'Đinh Sang Sơn đã mua khóa học "Kỹ Năng Bán Hàng Online" với giá 100.000đ',
    time: "Vừa xong",
    isRead: true, // Đã đọc
  },
  {
    id: 3,
    text: 'Đinh Sang Sơn đã mua khóa học "Kỹ Năng Bán Hàng Online" với giá 100.000đ',
    time: "1 phút trước",
    isRead: false, // Chưa đọc
  },
];

const Header = ({ onOpenLoginPopup }) => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogoClick() {
    navigate("/");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (state.searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(state.searchTerm.trim())}`);
    }
  }

  function handleSearchChange(e) {
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: e.target.value });
  }

  function handleLearnerCoursesClick() {
    navigate("/purchased");
  }

  function handleAdminCoursesClick() {
    navigate("/admin-courses");
  }

  function handleSellerCoursesClick() {
    navigate("/seller-courses");
  }

  function handleFavoritesClick() {
    navigate("/favorites");
  }

  function handleCartClick() {
    navigate("/cart");
  }

  function handleTransactionsClick() {
    navigate("/transactions");
  }

  function handleCategoriesClick() {
    navigate("admin-categories");
  }

  function handleUsersClick() {
    navigate("/admin-users");
  }

  function handleInfo() {
    navigate("/user-info");
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleLoginClick() {
    navigate("/login");
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  function handleRegisterClick() {
    navigate("/register");
  }

  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notificationRef = useRef(null);

  useEffect(() => {
    if (!isNotificationOpen) return;

    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  const handleNoficationClick = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const markOneAsRead = (id) => {
    setNotifications((currentNotifs) =>
      currentNotifs.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((currentNotifs) =>
      currentNotifs.map((n) => ({ ...n, isRead: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

        {/* Search bar - Desktop */}
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

        {/* Navigation Icons */}
        <nav className="nav-icons">
          {/* Admin */}
          {isLoggedIn && user && user.role === "Admin" ? (
            <>
              {/* Courses */}
              <button
                className="nav-button"
                onClick={handleAdminCoursesClick}
                title="Khóa học"
              >
                <List className="nav-icon" />
                <span className="nav-label">Khóa học</span>
              </button>

              {/* Transactions */}
              <button
                className="nav-button"
                onClick={handleTransactionsClick}
                title="Quản lý giao dịch"
              >
                <DollarSign className="nav-icon" />
                <span className="nav-label">Giao dịch</span>
              </button>

              {/* Categories */}
              <button
                className="nav-button"
                onClick={handleCategoriesClick}
                title="Quản lý danh mục"
              >
                <Server className="nav-icon" />
                <span className="nav-label">Danh mục</span>
              </button>

              {/* Users */}
              <button
                className="nav-button"
                onClick={handleUsersClick}
                title="Quản lý người dùng"
              >
                <Users className="nav-icon" />
                <span className="nav-label">Người dùng</span>
              </button>
            </>
          ) : null}

          {/* Seller */}
          {isLoggedIn && user && user.role === "Seller" ? (
            <>
              {/* Courses */}
              <button
                className="nav-button"
                onClick={handleSellerCoursesClick}
                title="Khóa học"
              >
                <List className="nav-icon" />
                <span className="nav-label">Khóa học</span>
              </button>

              {/* Notification */}
              <div className="notification-wrapper" ref={notificationRef}>
                <button
                  className="nav-button"
                  onClick={handleNoficationClick}
                  title="Thông báo"
                >
                  <BellRing className="nav-icon" />
                  {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                  )}
                  <span className="nav-label">Thông báo</span>
                </button>

                {isNotificationOpen && (
                  <NotificationPopup
                    notifications={notifications}
                    onMarkOneAsRead={markOneAsRead}
                    onMarkAllAsRead={markAllAsRead}
                  />
                )}
              </div>
            </>
          ) : null}

          {/* Learner */}
          {!isLoggedIn || (user && user.role === "Buyer") ? (
            <>
              {/* Courses */}
              <button
                className="nav-button"
                onClick={handleLearnerCoursesClick}
                title="Khóa học"
              >
                <List className="nav-icon" />
                {state.myCourses.length > 0 && (
                  <span className="badge">{state.myCourses.length}</span>
                )}
                <span className="nav-label">Khóa học</span>
              </button>

              {/* Favorites */}
              <button
                className="nav-button"
                onClick={handleFavoritesClick}
                title="Yêu thích"
              >
                <Heart className="nav-icon" />
                {state.favorites.length > 0 && (
                  <span className="badge">{state.favorites.length}</span>
                )}
                <span className="nav-label">Yêu thích</span>
              </button>

              {/* Cart */}
              <button
                className="nav-button"
                onClick={handleCartClick}
                title="Giỏ hàng"
              >
                <ShoppingCart className="nav-icon" />
                {state.cart.length > 0 && (
                  <span className="badge">{state.cart.length}</span>
                )}
                <span className="nav-label">Giỏ hàng</span>
              </button>
            </>
          ) : null}
          {/* User */}
          {isLoggedIn ? (
            <div className="user-menu destop-only">
              <button className="nav-button user-button" title={user?.fullName}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="user-avatar"
                  />
                ) : (
                  <User className="nav-icon" />
                )}
                <span className="nav-label">{user?.fullName}</span>
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

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
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

            {/* Mobile User Actions */}
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
                    <LogOut className="nav-icon" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <button
                    onClick={handleLoginClick}
                    className="mobile-auth-btn"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={handleRegisterClick}
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
