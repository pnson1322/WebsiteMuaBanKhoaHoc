import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { courseAPI } from "../services/courseAPI";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useDebounce } from "../hooks/useDebounce";
import CourseCard from "./CourseCard/CourseCard";
import "./LazyLoadCourses.css";

/**
 * ✅ REFACTORED LazyLoadCourses
 * - CHỈ dùng IntersectionObserver (bỏ scroll listener)
 * - Filter/search ở component level (không dispatch về Context)
 * - Courses state local, không lưu vào global context
 * - Stable callbacks cho CourseCard
 */
const LazyLoadCourses = ({ onViewDetails }) => {
  // === LOCAL STATE (không lưu vào Context) ===
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const pageSize = 9;
  const loadedPagesRef = useRef(new Set());

  // === CONTEXT (chỉ lấy cái cần) ===
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

  // Debounce search để tránh filter liên tục
  const debouncedSearch = useDebounce(state.searchTerm, 300);

  // === MEMOIZED SETS cho O(1) lookup ===
  const favoriteSet = useMemo(
    () => new Set(state.favorites),
    [state.favorites]
  );
  const cartSet = useMemo(() => new Set(state.cart), [state.cart]);
  const purchasedSet = useMemo(
    () => new Set(state.purchasedCourses),
    [state.purchasedCourses]
  );
  const showActions = useMemo(
    () => !isLoggedIn || user?.role === "Buyer",
    [isLoggedIn, user]
  );

  // === LOAD COURSES ===
  const loadCourses = useCallback(
    async (page, isLoadMore = false) => {
      // Tránh load trùng page
      if (loadedPagesRef.current.has(page) && isLoadMore) {
        return;
      }

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          loadedPagesRef.current.clear();
        }

        const data = await courseAPI.getCourses({ page, pageSize });
        const normalized = data.items.map((c) => ({ ...c, courseId: c.id }));

        loadedPagesRef.current.add(page);

        if (isLoadMore) {
          setCourses((prev) => {
            // Tránh duplicate
            const existingIds = new Set(prev.map((c) => c.id));
            const newCourses = normalized.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newCourses];
          });
        } else {
          setCourses(normalized);
        }

        setHasMore(page < (data.totalPages || 1));
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách khóa học");
        console.error("Load courses error:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize]
  );

  // === LOAD MORE (cho infinite scroll) ===
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return Promise.resolve();

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    return loadCourses(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, loadCourses]);

  // === INFINITE SCROLL HOOK ===
  const { observerTarget } = useInfiniteScroll({
    loadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
    rootMargin: "300px",
  });

  // === INITIAL LOAD ===
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadCourses(1, false);
  }, [loadCourses]);

  // === CLIENT-SIDE FILTER (không dispatch về Context) ===
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Search
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.categoryName?.toLowerCase().includes(term)
      );
    }

    // Category
    if (state.selectedCategory !== "Tất cả") {
      result = result.filter((c) => c.categoryName === state.selectedCategory);
    }

    // Price range
    if (state.selectedPriceRange?.label !== "Tất cả") {
      result = result.filter(
        (c) =>
          c.price >= state.selectedPriceRange.min &&
          c.price <= state.selectedPriceRange.max
      );
    }

    return result;
  }, [
    courses,
    debouncedSearch,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  // === STABLE CALLBACKS cho CourseCard ===
  const handleToggleFavorite = useCallback(
    async (courseId) => {
      if (!user) {
        dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
        return;
      }
      const isFav = favoriteSet.has(courseId);
      if (isFav) {
        const result = await removeFromFavorite(courseId);
        if (result.success) showUnfavorite("💔 Đã bỏ yêu thích");
        else showError("Lỗi khi bỏ yêu thích");
      } else {
        const result = await addToFavorite(courseId);
        if (result.success) showFavorite("❤️ Đã thêm vào yêu thích!");
        else showError("Lỗi khi thêm yêu thích");
      }
    },
    [
      user,
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

  const handleAddToCart = useCallback(
    async (courseId, title, isPurchased, isInCart) => {
      if (!user) {
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
      if (result.success) showSuccess(`🛒 Đã thêm "${title}" vào giỏ hàng!`);
      else showError("Lỗi khi thêm vào giỏ hàng.");
    },
    [user, dispatch, actionTypes, addToCart, showSuccess, showError]
  );

  // === RENDER: Error State ===
  if (error && !isLoading) {
    return (
      <div className="lazy-load-courses">
        <div className="error-state">
          <h2>Không thể tải khóa học</h2>
          <p>{error}</p>
          <button onClick={() => loadCourses(1, false)}>Thử lại</button>
        </div>
      </div>
    );
  }

  // === RENDER: Loading State ===
  if (isLoading) {
    return (
      <div className="lazy-load-courses">
        <div className="loading-skeleton-container">
          <div className="loading-header">
            <div className="loading-spinner"></div>
            <h3>Đang tải khóa học...</h3>
          </div>
          <div className="courses-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === RENDER: Main ===
  const hasFilters =
    debouncedSearch ||
    state.selectedCategory !== "Tất cả" ||
    state.selectedPriceRange?.label !== "Tất cả";

  return (
    <div className="lazy-load-courses">
      {/* Results Info */}
      {courses.length > 0 && (
        <div className="results-info">
          <p>
            Hiển thị {filteredCourses.length} trong số {courses.length} khóa học
            {hasFilters && ` (đã lọc)`}
          </p>
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <>
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const courseId = course.courseId || course.id;
              return (
                <CourseCard
                  key={courseId}
                  course={course}
                  isFavorite={favoriteSet.has(courseId)}
                  isInCart={cartSet.has(courseId)}
                  isPurchased={purchasedSet.has(courseId)}
                  showActions={showActions}
                  onViewDetails={onViewDetails}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>

          {/* Infinite Scroll Trigger */}
          <div
            ref={observerTarget}
            className="infinite-scroll-trigger"
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            {isLoadingMore && (
              <div className="loading-more">
                <div className="spinner"></div>
                <span>Đang tải thêm...</span>
              </div>
            )}
            {!hasMore && filteredCourses.length > 0 && (
              <p style={{ color: "#6c757d" }}>
                ✓ Đã hiển thị tất cả {filteredCourses.length} khóa học
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="no-results-state">
          <h3>Không tìm thấy khóa học phù hợp</h3>
          <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
          <button
            className="clear-filters-button"
            onClick={() => {
              dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: "" });
              dispatch({ type: actionTypes.SET_CATEGORY, payload: "Tất cả" });
              dispatch({
                type: actionTypes.SET_PRICE_RANGE,
                payload: { label: "Tất cả", min: 0, max: Infinity },
              });
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyLoadCourses);
