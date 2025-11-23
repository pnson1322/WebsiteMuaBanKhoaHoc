import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppState } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
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
import { notificationAPI } from "../services/notificationAPI";

import test from "../assets/test.jpg";
import momo from "../assets/momo.png";
import test2 from "../assets/test2.jpg";

const ALL_COURSES = [
  { id: 1, name: "Lập trình React cơ bản", imageUrl: test },
  { id: 2, name: "Lập trình Javascript nâng cao", imageUrl: test2 },
  { id: 3, name: "Giáo trình SQL cho người mới", imageUrl: momo },
  { id: 4, name: "Node.js và Express", imageUrl: test },
  { id: 5, name: "Giáo trình Python từ A-Z", imageUrl: test2 },
];

const Header = ({ onOpenLoginPopup }) => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { isLoggedIn, user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogoClick() {
    navigate("/");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (state.searchTerm.trim()) {
      setIsDropdownVisible(false);
      navigate(`/?search=${encodeURIComponent(state.searchTerm.trim())}`);
    }
  }

  function handleSearchChange(e) {
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: e.target.value });
  }

  function handleLearnerCoursesClick() {
    if (!isLoggedIn) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }
    navigate("/purchased");
  }

  function handleAdminCoursesClick() {
    navigate("/admin-courses");
  }

  function handleSellerCoursesClick() {
    navigate("/seller-courses");
  }

  function handleFavoritesClick() {
    if (!isLoggedIn) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }
    navigate("/favorites");
  }

  function handleCartClick() {
    if (!isLoggedIn) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }
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

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  useEffect(() => {
    if (!user || user.role !== "Seller") {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchData = async () => {
      try {
        const [notificationList, unreadCountAPI] = await Promise.all([
          notificationAPI.getNotification(),
          notificationAPI.getUnreadCount(),
        ]);

        console.log(notificationList);
        console.log(unreadCountAPI);

        setNotifications(
          (notificationList || []).map((item) => {
            const d = new Date(item.createdAt);
            const dateStr = d.toLocaleDateString("vi-VN");

            return {
              id: item.id,
              text: item.message,
              date: dateStr,
              isRead: item.isRead,
              sellerId: item.sellerId,
            };
          })
        );
        setUnreadCount(unreadCountAPI);
      } catch (err) {
        showError("Lỗi: " + err);
      }
    };

    fetchData();
  }, []);

  const handleNoficationClick = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const markOneAsRead = async (id) => {
    const targetNotif = notifications.find((n) => n.id === id);
    if (!targetNotif) return;

    if (targetNotif.isRead) return;

    setNotifications((currentNotifs) =>
      currentNotifs.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationAPI.markAsRead(id, targetNotif.sellerId);
    } catch (err) {
      showError("Lỗi: " + err.message);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((currentNotifs) =>
      currentNotifs.map((n) => ({ ...n, isRead: true }))
    );

    setUnreadCount(0);

    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      showError("Lỗi: " + err.message);
    }
  };

  const handleDeleteOne = async (id) => {
    const targetNotif = notifications.find((n) => n.id === id);
    if (!targetNotif) return;

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (!targetNotif.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationAPI.deleteNotification(id, targetNotif.sellerId);
    } catch (err) {
      showError("Lỗi: " + err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
      setNotifications([]);
      setUnreadCount(0);
    }

    try {
      await notificationAPI.deleteAllNotifications();
    } catch (err) {
      showError("Lỗi: " + err);
    }
  };

  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (state.searchTerm.trim() === "") {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }

    const timerId = setTimeout(() => {
      console.log("Đang lấy gợi ý cho:", state.searchTerm);

      const filteredSuggestions = ALL_COURSES.filter(
        (
          course //sau đổi thành course từ api
        ) => course.name.toLowerCase().includes(state.searchTerm.toLowerCase())
      );

      setSuggestions(filteredSuggestions);
      setIsDropdownVisible(filteredSuggestions.length > 0);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [state.searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestionName) => {
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: e.target.value });
    setIsDropdownVisible(false);
  };

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
          ref={searchContainerRef}
        >
          <Search className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Tìm kiếm khóa học, giáo trình..."
            value={state.searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownVisible(suggestions.length > 0)}
            autoComplete="off"
          />

          {isDropdownVisible && (
            <ul className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onMouseDown={() => handleSuggestionClick(suggestion.name)}
                  className="suggestion-item"
                >
                  <span className="suggestion-name">{suggestion.name}</span>

                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.name}
                    className="suggestion-image"
                  />
                </li>
              ))}
            </ul>
          )}
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
                    onDeleteOne={handleDeleteOne}
                    onDeleteAll={handleDeleteAll}
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
                {state.myCourses?.length > 0 && (
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
                {state.favorites?.length > 0 && (
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
                {state.cart?.length > 0 && (
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
