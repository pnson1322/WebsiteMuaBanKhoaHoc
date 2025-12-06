// src/components/chat/CourseList.jsx
import React, { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { chatAPI } from "../../services/chatAPI";
import "./CourseList.css";

const CourseList = ({ sellerId }) => {
  const { filterByCourse } = useChat();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [sellerId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getSellerCourses(sellerId);
      // API trả về { items: [...], page, pageSize, totalCount, totalPages }
      // Lấy mảng courses từ response.items
      setCourses(response.items || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (course) => {
    if (selectedCourse?.id === course.id) {
      // Deselect - show all conversations
      setSelectedCourse(null);
      await filterByCourse(null);
    } else {
      // Select course - filter conversations
      setSelectedCourse(course);
      await filterByCourse(course.id);
    }
  };

  const handleShowAll = async () => {
    setSelectedCourse(null);
    await filterByCourse(null);
  };

  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.totalPurchased || 0),
    0
  );

  return (
    <div className="chat-panel course-panel">
      {/* 1. Header Cố Định */}
      <div className="panel-header">
        <h2 className="header-title">
          Khóa học
          <span className="count-badge">{courses.length}</span>
        </h2>
        {selectedCourse && (
          <button
            className="reset-filter-btn"
            onClick={handleShowAll}
            title="Hiện tất cả"
          >
            ✕ Hiện tất cả
          </button>
        )}
      </div>

      {/* 2. Danh sách cuộn (Scrollable) */}
      <div className="course-items scrollable-content">
        {loading ? (
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
            const isSelected = selectedCourse?.id === course.id;
            const isActive = course.isApproved && !course.isRestricted;

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
                  {/* Chỉ hiện trạng thái nếu course bị dừng bán/chưa duyệt để cảnh báo */}
                  {!isActive && <div className="status-overlay">Dừng</div>}
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
      </div>

      {/* 3. Footer Thống kê Cố Định */}
      <div className="panel-footer course-footer">
        <div className="stat-row">
          <span>Tổng học viên:</span>
          <strong>{totalStudents.toLocaleString()}</strong>
        </div>
        <div className="stat-row">
          <span>Trạng thái:</span>
          <span className="status-text">
            {selectedCourse ? "Đang lọc theo khóa học" : "Hiển thị tất cả"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
