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
    // Stable callbacks - không tạo mới mỗi render
    const handleClick = useCallback(() => {
      onViewDetails(course);
    }, [course, onViewDetails]);

    const handleToggleFavorite = useCallback(
      (e) => {
        e.stopPropagation();
        onToggleFavorite(course.courseId || course.id);
      },
      [course.courseId, course.id, onToggleFavorite]
    );

    const handleAddToCart = useCallback(
      (e) => {
        e.stopPropagation();
        onAddToCart(
          course.courseId || course.id,
          course.title,
          isPurchased,
          isInCart
        );
      },
      [
        course.courseId,
        course.id,
        course.title,
        isPurchased,
        isInCart,
        onAddToCart,
      ]
    );

    const handleViewDetailsClick = useCallback(() => {
      onViewDetails(course);
    }, [course, onViewDetails]);

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
