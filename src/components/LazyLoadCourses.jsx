import React, { useEffect } from "react";
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

  // 🔥 Gọi API thật để lấy danh sách khóa học
  useEffect(() => {
    const loadCourses = async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING_SUGGESTIONS, payload: true });

        const data = await courseAPI.getCourses({
          page: 1,
          pageSize: 50,
        });

        // 🟢 Lưu vào AppContext
        dispatch({
          type: actionTypes.SET_COURSES,
          payload: data.items.map((c) => ({ ...c, courseId: c.id })),
        });
      } catch (err) {
        dispatch({
          type: actionTypes.SET_ERROR,
          payload: "Không thể tải danh sách khóa học",
        });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING_SUGGESTIONS, payload: false });
      }
    };

    loadCourses();
  }, [dispatch, actionTypes]);

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
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CardComponent
              key={course.id}
              course={course}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
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

      {displayedCourses > 0 && (
        <div className="end-of-results">
          <p>
            {hasActiveFilters && displayedCourses !== totalCourses
              ? "Bạn đã xem hết tất cả khóa học phù hợp với bộ lọc hiện tại!"
              : "Bạn đã xem hết tất cả khóa học!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default LazyLoadCourses;
