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

const CourseCard = ({ course, onViewDetails }) => {
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { isLoggedIn } = useAuth();
  const { showFavorite, showUnfavorite, showSuccess, showError } = useToast();

  const isFavorite = state.favorites.includes(course.courseId);
  const isInCart = state.cart.includes(course.courseId);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }

    try {
      if (isFavorite) {
        // Xóa khỏi yêu thích
        await favoriteAPI.removeFavorite(course.courseId);
        dispatch({
          type: actionTypes.REMOVE_FROM_FAVORITES,
          payload: course.courseId,
        });
        showUnfavorite(`💔 Đã bỏ yêu thích "${course.title}"`);
      } else {
        // Thêm vào yêu thích
        await favoriteAPI.addFavorite(course.courseId);
        dispatch({
          type: actionTypes.ADD_TO_FAVORITES,
          payload: course.courseId,
        });
        showFavorite(`❤️ Đã thêm "${course.title}" vào danh sách yêu thích!`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi thao tác yêu thích:", error);
      showError("Không thể thực hiện thao tác. Vui lòng thử lại!");
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
      dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
      return;
    }

    if (isInCart) return;

    dispatch({
      type: actionTypes.ADD_TO_CART,
      payload: course.courseId,
    });

    showSuccess(`🛒 Đã thêm "${course.title}" vào giỏ hàng!`);
  };

  return (
    <div className="course-card" onClick={() => onViewDetails(course)}>
      <CourseImageSection
        course={course}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
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
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
