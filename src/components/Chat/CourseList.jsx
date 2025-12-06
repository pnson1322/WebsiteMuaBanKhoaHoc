// src/components/chat/CourseList.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { chatAPI } from '../../services/chatAPI';
import './CourseList.css';

const CourseList = ({ sellerId }) => {
  // 1. ✅ LOGIC CỦA BẠN: Lấy Context và State phân trang
  const { filterByCourse, activeCourseFilter } = useChat();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Ref cho thanh cuộn (Logic của bạn)
  const listRef = useRef(null);

  // 2. ✅ LOGIC CỦA BẠN: Hàm gọi API có phân trang
  const fetchCourses = useCallback(async (pageNum) => {
    if (!sellerId) return;

    try {
      setLoading(true);
      const pageSize = 10;

      const response = await chatAPI.getSellerCourses(sellerId, pageNum, pageSize);
      const newItems = response.items || [];
      const totalCount = response.totalCount || 0;

      setCourses(prev => {
        if (pageNum === 1) {
          return newItems;
        } else {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueItems = newItems.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueItems];
        }
      });

      setPage(pageNum);
      setHasMore(newItems.length === pageSize && (pageNum * pageSize) < totalCount);

    } catch (error) {
      console.error('Error loading courses:', error);
      if (pageNum === 1) setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  // Load trang 1 khi mount
  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  // 3. ✅ LOGIC CỦA BẠN: Xử lý cuộn load more
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
        console.log("📥 Loading more courses...");
        fetchCourses(page + 1);
      }
    }
  };

  // 4. ✅ LOGIC CỦA BẠN: Xử lý chọn khóa học
  const handleCourseSelect = async (course) => {
    const isSelected = activeCourseFilter?.toString() === course.id.toString();
    if (isSelected) {
      await filterByCourse(null);
    } else {
      await filterByCourse(course.id);
    }
  };

  const handleShowAll = async () => {
    await filterByCourse(null);
  };

  // Tính tổng học viên (để hiển thị ở Footer giống layout bạn bè)
  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.totalPurchased || 0),
    0
  );

  return (
    // ✅ UI WRAPPER CỦA BẠN BÈ: chat-panel course-panel
    <div className="chat-panel course-panel">

      {/* --- HEADER --- */}
      <div className="panel-header">
        <h2 className="header-title">
          Khóa học
          <span className="count-badge">{courses.length}</span>
        </h2>
        {activeCourseFilter && (
          <button
            className="reset-filter-btn"
            onClick={handleShowAll}
            title="Hiện tất cả"
          >
            ✕ Hiện tất cả
          </button>
        )}
      </div>

      {/* --- BODY DANH SÁCH --- */}
      {/* ✅ Dùng class của bạn bè nhưng gắn REF và ON_SCROLL của bạn */}
      <div
        className="course-items scrollable-content"
        ref={listRef}
        onScroll={handleScroll}
      >
        {loading && courses.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa đăng khóa học nào</p>
          </div>
        ) : (
          courses.map((course) => {
            // Logic kiểm tra active của bạn
            const isSelected = activeCourseFilter?.toString() === course.id.toString();
            // Logic hiển thị trạng thái (nếu có trường này từ API)
            const isActiveStatus = course.isApproved !== false && course.isRestricted !== true;

            return (
              <div
                key={course.id}
                className={`course-card-small ${isSelected ? "selected" : ""}`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="course-thumb-wrapper">
                  <img
                    src={course.imageUrl || "/default-course.png"}
                    alt={course.title}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/60x60?text=Course";
                    }}
                  />
                  {/* Overlay nếu bị dừng (Feature UI của bạn bè) */}
                  {!isActiveStatus && <div className="status-overlay">Dừng</div>}
                </div>

                <div className="course-details">
                  <h4 className="course-name" title={course.title}>
                    {course.title}
                  </h4>

                  <div className="course-metrics">
                    <span className="metric-item">
                      👥 <b>{course.totalPurchased || 0}</b>
                    </span>
                    {course.unreadMessageCount > 0 && (
                      <span className="metric-item highlight">
                        📩 <b>{course.unreadMessageCount}</b>
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <div className="selected-check">✔</div>}
              </div>
            );
          })
        )}

        {/* ✅ Logic Load more Spinner của bạn đặt ở cuối list */}
        {loading && courses.length > 0 && (
          <div className="loading-more" style={{ textAlign: 'center', padding: '10px' }}>
            <div className="spinner-small" style={{ display: 'inline-block' }}></div>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="panel-footer course-footer">
        <div className="stat-row">
          <span>Tổng học viên (đã tải):</span>
          <strong>{totalStudents.toLocaleString()}</strong>
        </div>
        <div className="stat-row">
          <span>Trạng thái:</span>
          <span className="status-text">
            {activeCourseFilter ? "Đang lọc theo khóa học" : "Hiển thị tất cả"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseList;