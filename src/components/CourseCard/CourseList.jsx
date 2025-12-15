import React, { useCallback, useMemo } from "react";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import CourseCard from "./CourseCard";

/**
 * ✅ CourseList - Container component
 * - Subscribe Context TẠI ĐÂY, không phải trong Card
 * - Tính toán isFavorite, isInCart cho từng card
 * - Truyền stable callbacks xuống
 */
const CourseList = ({ courses, onViewDetails }) => {
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

  // Memoize Sets để lookup O(1)
  const favoriteSet = useMemo(
    () => new Set(state.favorites),
    [state.favorites]
  );
  const cartSet = useMemo(() => new Set(state.cart), [state.cart]);
  const purchasedSet = useMemo(
    () => new Set(state.purchasedCourses),
    [state.purchasedCourses]
  );

  // Chỉ Buyer hoặc guest mới thấy actions
  const showActions = useMemo(
    () => !isLoggedIn || (user && user.role === "Buyer"),
    [isLoggedIn, user]
  );

  // Stable callback - toggle favorite
  const handleToggleFavorite = useCallback(
    async (courseId) => {
      const isAuth =
        isLoggedIn || localStorage.getItem("isLoggedIn") === "true";

      if (!isAuth) {
        dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
        return;
      }

      const isFav = favoriteSet.has(courseId);
      if (isFav) {
        const result = await removeFromFavorite(courseId);
        if (result.success) {
          showUnfavorite("💔 Đã bỏ yêu thích");
        } else {
          showError("Lỗi khi bỏ yêu thích");
        }
      } else {
        const result = await addToFavorite(courseId);
        if (result.success) {
          showFavorite("❤️ Đã thêm vào yêu thích!");
        } else {
          showError("Lỗi khi thêm yêu thích");
        }
      }
    },
    [
      isLoggedIn,
      favoriteSet,
      dispatch,
      actionTypes,
      addToFavorite,
      removeFromFavorite,
      showFavorite,
      showUnfavorite,
      showError,
    ]
  );

  // Stable callback - add to cart
  const handleAddToCart = useCallback(
    async (courseId, title, isPurchased, isInCart) => {
      const isAuth =
        isLoggedIn || localStorage.getItem("isLoggedIn") === "true";

      if (!isAuth) {
        dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
        return;
      }

      if (isPurchased) {
        showError("Bạn đã sở hữu khóa học này rồi!");
        return;
      }

      if (isInCart) {
        showError("Đã có trong giỏ hàng.");
        return;
      }

      const result = await addToCart(courseId);
      if (result.success) {
        showSuccess(`🛒 Đã thêm "${title}" vào giỏ hàng!`);
      } else {
        showError("Lỗi khi thêm vào giỏ hàng.");
      }
    },
    [isLoggedIn, dispatch, actionTypes, addToCart, showSuccess, showError]
  );

  return (
    <div className="courses-grid">
      {courses.map((course, index) => {
        const courseId = course.courseId || course.id;
        return (
          <CourseCard
            key={courseId}
            course={course}
            isFavorite={favoriteSet.has(courseId)}
            isInCart={cartSet.has(courseId)}
            isPurchased={purchasedSet.has(courseId)}
            showActions={showActions}
            priority={index < 6}
            onViewDetails={onViewDetails}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
          />
        );
      })}
    </div>
  );
};

export default React.memo(CourseList);
