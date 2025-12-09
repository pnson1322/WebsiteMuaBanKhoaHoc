import React from "react";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { favoriteAPI } from "../../services/favoriteAPI";
import "./CourseCard.css";
import CourseImageSection from "./CourseImageSection";
import CourseContent from "./CourseContent";
import CourseStats from "./CourseStats";
import CourseFooter from "./CourseFooter";

const CourseCard = React.memo(({ course, onViewDetails }) => {
  const state = useAppState();
  const {
    addToCart,
    addToFavorite,
    removeFromFavorite,
    dispatch,
    actionTypes,
  } = useAppDispatch();
  const { isLoggedIn, user } = useAuth();
  const { showFavorite, showUnfavorite, showSuccess, showError } = useToast();

  const isFavorite = state.favorites.includes(course.courseId);
  const isInCart = state.cart.includes(course.courseId);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    if (!user) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }

    if (isFavorite) {
      const result = await removeFromFavorite(course.courseId);
      if (result.success) {
        showUnfavorite(`💔 Đã bỏ yêu thích "${course.title}"`);
      } else {
        showError("Lỗi khi bỏ yêu thích");
      }
    } else {
      const result = await addToFavorite(course.courseId);
      if (result.success) {
        showFavorite(`❤️ Đã thêm "${course.title}" vào yêu thích!`);
      } else {
        showError("Lỗi khi thêm yêu thích");
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!user) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }

    if (isInCart) return;

    const result = await addToCart(course.courseId);

    if (result.success) {
      showSuccess(`🛒 Đã thêm "${course.title}" vào giỏ hàng!`);
    } else {
      showError("Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  // Chỉ hiển thị nút yêu thích và giỏ hàng cho Buyer hoặc người chưa đăng nhập
  const showActions = !isLoggedIn || (user && user.role === "Buyer");

  return (
    <div className="course-card" onClick={() => onViewDetails(course)}>
      <CourseImageSection
        course={course}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        showFavoriteButton={showActions}
      />

      <div className="course-content">
        <div className="course-main">
          <CourseContent course={course} />
        </div>

        <div className="course-bottom">
          <CourseStats course={course} />
          <CourseFooter
            course={course}
            isInCart={isInCart}
            onAddToCart={handleAddToCart}
            onViewDetails={() => onViewDetails(course)}
            showCartButton={showActions}
          />
        </div>
      </div>
    </div>
  );
});

export default CourseCard;
