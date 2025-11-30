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
import signalRService from "../services/signalRService"; // ✅ Import SignalR

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
import { courseAPI } from "../services/courseAPI";

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

  // ============ NOTIFICATION STATE ============
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false); // ✅ Thêm state để track connection

  const notificationRef = useRef(null);

  // ============ CLICK OUTSIDE TO CLOSE NOTIFICATION ============
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

  // ============ INIT SIGNALR & LOAD NOTIFICATIONS ============
  useEffect(() => {
    // Chỉ khởi tạo cho Seller
    if (!user || user.role !== "Seller") {
      setNotifications([]);
      setUnreadCount(0);
      setIsSignalRConnected(false);
      return;
    }

    let isMounted = true;

    const initSignalR = async () => {
      try {
        console.log("🚀 Starting SignalR initialization for seller:", user.id);

        // 1. Load dữ liệu ban đầu TRƯỚC
        await fetchInitialData();

        // 2. Lấy token
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No access token found");
          return;
        }

        // 3. Kết nối SignalR
        await signalRService.startConnection(token);

        if (!isMounted) return;

        console.log("✅ SignalR connected for seller:", user.id);

        // 4. Đăng ký các event listeners TRƯỚC KHI join group
        signalRService.onNotificationReceived((notification) => {
          console.log("🔔 New notification received:", notification);

          if (!isMounted) return;

          const newNotif = {
            id: notification.id,
            text: notification.message,
            date: formatNotificationDate(notification.createdAt || new Date()),
            isRead: false,
            sellerId: notification.sellerId,
          };

          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          if (Notification.permission === "granted") {
            new Notification("EduMart - Thông báo mới", {
              body: notification.message,
              icon: "/logo.png",
              badge: "/badge.png",
            });
          }

          playNotificationSound();
          showSuccess("Bạn có thông báo mới!");
        });

        // ⚠️ FIX: Đổi tên event từ "JoinedGroup" thành "joinedGroup"
        signalRService.onJoinedGroup((data) => {
          console.log("✅ Joined notification group:", data);
        });

        // 5. Sau đó mới join vào seller group
        await signalRService.joinSellerGroup(user.id);

        if (!isMounted) return;

        setIsSignalRConnected(true);

      } catch (error) {
        console.error("❌ Error initializing SignalR:", error);
        setIsSignalRConnected(false);
        showError("Không thể kết nối real-time notification");
      }
    };

    const fetchInitialData = async () => {
      try {
        console.log("📡 Fetching initial notification data...");

        const [notificationList, unreadCountAPI] = await Promise.all([
          notificationAPI.getNotification(),
          notificationAPI.getUnreadCount(),
        ]);

        if (!isMounted) return;

        console.log("📋 Loaded notifications:", notificationList);
        console.log("📊 Unread count:", unreadCountAPI);

        if (!Array.isArray(notificationList)) {
          console.error("❌ Notification list is not an array:", notificationList);
          setNotifications([]);
          setUnreadCount(0);
          return;
        }

        const formattedNotifications = notificationList.map((item) => ({
          id: item.id,
          text: item.message,
          date: formatNotificationDate(item.createdAt),
          isRead: item.isRead,
          sellerId: item.sellerId,
        }));

        console.log("✅ Formatted notifications:", formattedNotifications);

        setNotifications(formattedNotifications);
        setUnreadCount(unreadCountAPI || 0);

      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
        console.error("Error details:", err.response?.data || err.message);

        if (isMounted) {
          showError("Không thể tải thông báo: " + (err.response?.data?.message || err.message));
        }
      }
    };

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    initSignalR();

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up SignalR connection...");
      isMounted = false;
      if (user?.id && signalRService.isConnected()) {
        signalRService.leaveSellerGroup(user.id).catch(console.error);
      }
    };
  }, [user, showError, showSuccess]);

  // ============ HELPER FUNCTIONS ============
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;
      audio.play().catch((e) => console.log("Cannot play sound:", e));
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  // ============ NOTIFICATION ACTIONS ============
  const handleNoficationClick = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const markOneAsRead = async (id) => {
    const targetNotif = notifications.find((n) => n.id === id);
    if (!targetNotif) return;

    if (targetNotif.isRead) return;

    // Optimistic update
    setNotifications((currentNotifs) =>
      currentNotifs.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationAPI.markAsRead(id);
      console.log(`✅ Marked notification ${id} as read`);
    } catch (err) {
      console.error("❌ Error marking as read:", err);
      showError("Không thể đánh dấu đã đọc, vui lòng thử lại sau");

      // Rollback on error
      setNotifications((currentNotifs) =>
        currentNotifs.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications((currentNotifs) =>
      currentNotifs.map((n) => ({ ...n, isRead: true }))
    );

    setUnreadCount(0);

    try {
      await notificationAPI.markAllAsRead();
      console.log("✅ Marked all as read");
      showSuccess("Đã đánh dấu tất cả là đã đọc");
    } catch (err) {
      console.error("❌ Error marking all as read:", err);
      showError("Không thể đánh dấu tất cả: " + err.message);

      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  const handleDeleteOne = async (id) => {
    const targetNotif = notifications.find((n) => n.id === id);
    if (!targetNotif) return;

    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (!targetNotif.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationAPI.deleteNotification(id);
      console.log(`✅ Deleted notification ${id}`);
    } catch (err) {
      console.error("❌ Error deleting notification:", err);
      showError("Không thể xóa thông báo: " + err.message);

      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
      return;
    }

    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationAPI.deleteAllNotifications();
      console.log("✅ Deleted all notifications");
      showSuccess("Đã xóa tất cả thông báo");
    } catch (err) {
      console.error("❌ Error deleting all notifications:", err);
      showError("Không thể xóa tất cả: " + err.message);

      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  // ============ SEARCH SUGGESTIONS ============
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (state.searchTerm.trim() === "") {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }

    const timerId = setTimeout(async () => {
      console.log("Đang lấy gợi ý cho:", state.searchTerm);

      const filteredSuggestions = ALL_COURSES.filter((course) =>
        course.name.toLowerCase().includes(state.searchTerm.toLowerCase())
      );

      try {
        const res = await courseAPI.getCourses({
          page: 1,
          pageSize: 100,
        });

        const coursesFromApi = res.items || [];

        const filteredSuggestions = coursesFromApi.filter((course) =>
          course.title.toLowerCase().includes(state.searchTerm.toLowerCase())
        );

        setSuggestions(
          filteredSuggestions.map((item) => ({
            id: item.id,
            name: item.title,
            imageUrl: item.imageUrl,
          }))
        );
        setSuggestions(filteredSuggestions);
        setIsDropdownVisible(filteredSuggestions.length > 0);
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý tìm kiếm:", error);
        setSuggestions([]);
        setIsDropdownVisible(false);
      }
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

  const handleSuggestionClick = (suggestionTitle) => {
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: suggestionTitle });

    setIsDropdownVisible(false);

    navigate(`/?search=${encodeURIComponent(suggestionTitle)}`);
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
                  onMouseDown={() => handleSuggestionClick(suggestion.title)}
                  className="suggestion-item"
                >
                  <span className="suggestion-name">{suggestion.title}</span>

                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.title}
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

              {/* Notification - ✅ CẢI THIỆN */}
              <div className="notification-wrapper" ref={notificationRef}>
                <button
                  className="nav-button notification-btn"
                  onClick={handleNoficationClick}
                  title="Thông báo"
                >
                  <BellRing className="nav-icon" />
                  {unreadCount > 0 && (
                    <span className="badge pulse">{unreadCount}</span>
                  )}
                  {isSignalRConnected && (
                    <span className="connection-indicator connected" />
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
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="user-avatar"
                  />
                ) : (
                  <>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.fullName
                      )}&background=random&color=fff`}
                      alt={user.fullName}
                      className="user-avatar"
                    />
                  </>
                )}
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
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="user-avatar"
                      />
                    ) : (
                      <>
                        <User className="nav-icon" />
                        <span>{user?.fullName}</span>
                      </>
                    )}
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