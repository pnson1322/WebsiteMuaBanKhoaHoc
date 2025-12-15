import React, { useCallback } from "react";
import "./CourseCard.css";
import CourseImageSection from "./CourseImageSection";
import CourseContent from "./CourseContent";
import CourseStats from "./CourseStats";
import CourseFooter from "./CourseFooter";

/**
 * ✅ REFACTORED CourseCard - Pure Component
 * - KHÔNG subscribe Context trực tiếp
 * - Nhận TẤT CẢ data qua props
 * - Dùng useCallback cho event handlers
 * - React.memo với custom comparator
 */
const CourseCard = React.memo(
  ({
    course,
    isFavorite,
    isInCart,
    isPurchased,
    showActions,
    onViewDetails,
    onToggleFavorite,
    onAddToCart,
  }) => {
    // Lấy courseId một lần
    const courseId = course.courseId || course.id;

    // Stable callbacks - chỉ phụ thuộc vào primitive values
    const handleClick = useCallback(() => {
      onViewDetails(course);
    }, [onViewDetails, courseId]); // eslint-disable-line

    const handleToggleFavorite = useCallback(
      (e) => {
        e.stopPropagation();
        onToggleFavorite(courseId);
      },
      [courseId, onToggleFavorite]
    );

    const handleAddToCart = useCallback(
      (e) => {
        e.stopPropagation();
        onAddToCart(courseId, course.title, isPurchased, isInCart);
      },
      [courseId, course.title, isPurchased, isInCart, onAddToCart]
    );

    const handleViewDetailsClick = useCallback(() => {
      onViewDetails(course);
    }, [onViewDetails, courseId]); // eslint-disable-line

    return (
      <div className="course-card" onClick={handleClick}>
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
              onViewDetails={handleViewDetailsClick}
              showCartButton={showActions}
            />
          </div>
        </div>
      </div>
    );
  },
  // Custom comparator - chỉ re-render khi props thực sự thay đổi
  (prevProps, nextProps) => {
    return (
      prevProps.course.id === nextProps.course.id &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.isInCart === nextProps.isInCart &&
      prevProps.isPurchased === nextProps.isPurchased &&
      prevProps.showActions === nextProps.showActions
    );
  }
);

CourseCard.displayName = "CourseCard";

export default CourseCard;
