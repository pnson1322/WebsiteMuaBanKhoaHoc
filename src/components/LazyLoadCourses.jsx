import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import { courseAPI } from "../services/courseAPI";
import CourseCard from "./CourseCard/CourseCard";
import "./LazyLoadCourses.css";

const LazyLoadCourses = ({ onViewDetails, CardComponent = CourseCard }) => {
  const {
    courses,
    filteredCourses,
    isLoadingSuggestions,
    error,
    searchTerm,
    selectedCategory,
    selectedPriceRange,
  } = useAppState();

  const { dispatch, actionTypes } = useAppDispatch();

  // Local states cho infinite scroll
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 9;
  const observerTarget = useRef(null);
  const isLoadingRef = useRef(false);

  // 🔥 Gọi API thật để lấy danh sách khóa học với infinite scroll
  const loadCourses = useCallback(
    async (page, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          dispatch({
            type: actionTypes.SET_LOADING_SUGGESTIONS,
            payload: true,
          });
        }

        const data = await courseAPI.getCourses({
          page: page,
          pageSize: pageSize,
        });

        const normalized = data.items.map((c) => ({ ...c, courseId: c.id }));

        // 🟢 Lưu vào AppContext với functional update
        if (isLoadMore) {
          // Append courses - cần implement APPEND_COURSES action
          dispatch({
            type: actionTypes.APPEND_COURSES,
            payload: normalized,
          });
        } else {
          // Replace courses
          dispatch({
            type: actionTypes.SET_COURSES,
            payload: normalized,
          });
        }

        setHasMore(page < (data.totalPages || 1));
      } catch (err) {
        dispatch({
          type: actionTypes.SET_ERROR,
          payload: "Không thể tải danh sách khóa học",
        });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING_SUGGESTIONS, payload: false });
        setLoadingMore(false);
      }
    },
    [dispatch, actionTypes, pageSize]
  );

  // Load lần đầu - chỉ chạy một lần khi component mount
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadCourses(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency để chỉ chạy một lần

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 300;

      if (
        scrolledToBottom &&
        hasMore &&
        !isLoadingSuggestions &&
        !loadingMore &&
        !isLoadingRef.current
      ) {
        isLoadingRef.current = true;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadCourses(nextPage, true).finally(() => {
          isLoadingRef.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingSuggestions, loadingMore, currentPage, loadCourses]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingSuggestions &&
          !loadingMore &&
          !isLoadingRef.current
        ) {
          isLoadingRef.current = true;
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadCourses(nextPage, true).finally(() => {
            isLoadingRef.current = false;
          });
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingSuggestions, loadingMore, currentPage, loadCourses]);

  // LOADING
  if (error) {
    return (
      <div className="lazy-load-courses">
        <div className="error-state">
          <div className="error-iconn">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
              onClick={() => window.location.reload()}
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
              <strong>Gợi ý:</strong>
            </p>
            <ul>
              <li>Kiểm tra kết nối internet của bạn</li>
              <li>Thử tải lại trang</li>
              <li>Xóa cache trình duyệt</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  if (isLoadingSuggestions) {
    return (
      <div className="lazy-load-courses">
        <div className="loading-skeleton-container">
          <div className="loading-header">
            <div className="loading-spinner"></div>
            <h3>Đang tải khóa học...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
          <div className="courses-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-footer">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-price"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TÍNH SỐ LƯỢNG
  const totalCourses = courses?.length || 0;
  const displayedCourses = filteredCourses?.length || 0;

  const hasActiveFilters =
    (searchTerm && searchTerm.trim() !== "") ||
    selectedCategory !== "Tất cả" ||
    (selectedPriceRange && selectedPriceRange.label !== "Tất cả");

  const showSummary = totalCourses > 0 || displayedCourses > 0;

  return (
    <div className="lazy-load-courses">
      {showSummary && (
        <div className="results-info">
          <p>
            Hiển thị {displayedCourses} trong số {totalCourses} khóa học
            {hasActiveFilters && totalCourses > 0
              ? ` - Có ${displayedCourses} khóa học phù hợp với bộ lọc hiện tại`
              : ""}
          </p>
        </div>
      )}

      {filteredCourses && filteredCourses.length > 0 ? (
        <>
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <CardComponent
                key={course.id}
                course={course}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div
            ref={observerTarget}
            style={{
              minHeight: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "30px auto",
              gap: "12px",
              border: hasMore ? "2px dashed #e0e0e0" : "none",
              borderRadius: "12px",
              padding: "25px",
              backgroundColor: hasMore ? "#fafafa" : "transparent",
              maxWidth: "500px",
              transition: "all 0.3s ease",
            }}
          >
            {loadingMore && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#007bff",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #007bff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Đang tải thêm khóa học...
              </div>
            )}
            {!hasMore && filteredCourses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  color: "#28a745",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#d4edda",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  ✓
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#155724",
                  }}
                >
                  Đã hiển thị tất cả {filteredCourses.length} khóa học
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#6c757d",
                  }}
                >
                  Bạn đã xem hết danh sách khóa học
                </p>
              </div>
            )}
            {hasMore && !loadingMore && (
              <>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "14px",
                    margin: "0 0 10px 0",
                    fontStyle: "italic",
                  }}
                >
                  Scroll xuống để tải thêm hoặc
                </p>
                <button
                  onClick={() => {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    loadCourses(nextPage, true);
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,123,255,0.2)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#0056b3";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(0,123,255,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#007bff";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,123,255,0.2)";
                  }}
                >
                  📚 Tải thêm khóa học
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="no-results-state">
          <div className="no-results-icon">
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3>Không tìm thấy khóa học phù hợp</h3>
          <p>
            Không có khóa học nào khớp với bộ lọc của bạn.
            <br />
            Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc xóa bộ lọc.
          </p>
          <div className="no-results-suggestions">
            <p>
              <strong>Gợi ý:</strong>
            </p>
            <ul>
              <li>Thử tìm kiếm với từ khóa khác</li>
              <li>Mở rộng khoảng giá</li>
              <li>Chọn danh mục khác</li>
              <li>Xóa tất cả bộ lọc để xem toàn bộ khóa học</li>
            </ul>
          </div>
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default LazyLoadCourses;
