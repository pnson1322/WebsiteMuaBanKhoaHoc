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
  Bot,
  User,
  LogOut,
  Sparkles,
  List,
  DollarSign,
  Server,
  Users,
} from "lucide-react";

const Header = ({ onOpenChatbox, onOpenLoginPopup }) => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { isLoggedIn, user, logout } = useAuth();

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

  function handleAISuggestionsClick() {}

  function handleLearnerCoursesClick() {
    navigate("/learner-courses");
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
    navigate("/categories");
  }

  function handleUsersClick() {
    navigate("/users");
  }

  function handleInfo() {
    navigate("user-info");
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleLoginClick() {}

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
          {isLoggedIn && user && user.role === "admin" ? (
            <>
              {/* AI Chatbot */}
              <button
                className="nav-button"
                onClick={onOpenChatbox}
                title="AI Tư vấn"
              >
                <Bot className="nav-icon" />
                <span className="nav-label">AI Tư vấn</span>
              </button>

              {/* AI Suggestions */}
              <button
                className="nav-button"
                onClick={handleAISuggestionsClick}
                title="AI Gợi ý"
              >
                <Sparkles className="nav-icon" />
                <span className="nav-label">AI Gợi ý</span>
              </button>

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
          {isLoggedIn && user && user.role === "seller" ? (
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
            </>
          ) : null}

          {/* Learner */}
          {!isLoggedIn || (user && user.role === "learner") ? (
            <>
              {/* AI Chatbot */}
              <button
                className="nav-button"
                onClick={onOpenChatbox}
                title="AI Tư vấn"
              >
                <Bot className="nav-icon" />
                <span className="nav-label">AI Tư vấn</span>
              </button>

              {/* AI Suggestions */}
              <button
                className="nav-button"
                onClick={handleAISuggestionsClick}
                title="AI Gợi ý"
              >
                <Sparkles className="nav-icon" />
                <span className="nav-label">AI Gợi ý</span>
              </button>

              {/* Courses */}
              <button
                className="nav-button"
                onClick={handleLearnerCoursesClick}
                title="Khóa học"
              >
                <List className="nav-icon" />
                {state.courses.length > 0 && (
                  <span className="badge">{state.courses.length}</span>
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
        </nav>
      </div>

      {/* Auth Moadl */}
    </header>
  );
};

export default Header;
