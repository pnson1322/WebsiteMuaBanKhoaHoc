import React from "react";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import "./CourseCard.css";
import CourseImageSection from "./CourseImageSection";
import CourseContent from "./CourseContent";
import CourseStats from "./CourseStats";
import CourseFooter from "./CourseFooter";

const CourseCard = ({ course, onViewDetails }) => {
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { showFavorite, showUnfavorite, showSuccess } = useToast();

  const isFavorite = state.favorites.includes(course.courseId);
  const isInCart = state.cart.includes(course.courseId);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch({
        type: actionTypes.REMOVE_FROM_FAVORITES,
        payload: course.courseId,
      });
      showUnfavorite(`💔 Đã bỏ yêu thích "${course.title}"`);
    } else {
      dispatch({
        type: actionTypes.ADD_TO_FAVORITES,
        payload: course.courseId,
      });
      showFavorite(`❤️ Đã thêm "${course.title}" vào danh sách yêu thích!`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
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
