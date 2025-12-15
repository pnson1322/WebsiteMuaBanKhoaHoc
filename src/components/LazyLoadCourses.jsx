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

      const startTime = Date.now();
      const MIN_LOADING_TIME = 20000; // 20 giây chờ tối thiểu trước khi hiện lỗi

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setError(null); // Reset error khi bắt đầu load
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
        setIsLoading(false);
        setIsLoadingMore(false);
      } catch (err) {
        console.error("Load courses error:", err);

        // Chờ đủ 20s trước khi hiển thị lỗi (chỉ cho lần load đầu)
        if (!isLoadMore) {
          const elapsed = Date.now() - startTime;
          const remaining = MIN_LOADING_TIME - elapsed;

          if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
          }
        }

        setError("Không thể tải danh sách khóa học");
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
          <div className="error-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2>Không thể tải khóa học</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button
              className="retry-button"
              onClick={() => loadCourses(1, false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Thử lại
            </button>
            <button
              className="contact-button"
              onClick={() =>
                (window.location.href = "mailto:support@example.com")
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Liên hệ hỗ trợ
            </button>
          </div>
          <div className="error-tips">
            <p>
              <strong>💡 Gợi ý khắc phục:</strong>
            </p>
            <ul>
              <li>Kiểm tra kết nối internet của bạn</li>
              <li>Thử tải lại trang sau vài giây</li>
              <li>Xóa cache và cookies trình duyệt</li>
              <li>Thử sử dụng trình duyệt khác</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // === RENDER: Loading State - Skeleton Cards trong Grid ===
  if (isLoading) {
    return (
      <div className="lazy-load-courses">
        <div className="results-info skeleton-results">
          <div
            className="skeleton-text-line"
            style={{ width: "200px", height: "16px" }}
          ></div>
        </div>
        <div className="courses-grid">
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="skeleton-card course-card-skeleton">
              <div className="skeleton-image">
                <div className="skeleton-shimmer"></div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton-category"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-price-row">
                  <div className="skeleton-price"></div>
                  <div className="skeleton-rating"></div>
                </div>
                <div className="skeleton-actions">
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button small"></div>
                </div>
              </div>
            </div>
          ))}
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
            {filteredCourses.map((course, index) => {
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
