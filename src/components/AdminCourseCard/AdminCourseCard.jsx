import React, { useState, useEffect } from "react";
import { Check, Pencil, X } from "lucide-react";
import "../CourseCard/CourseCard.css";
import CourseStats from "../../components/CourseCard/CourseStats";
import "./AdminCourseCard.css";
import { useNavigate } from "react-router-dom";
const AdminCourseCard = ({ course, onToggleApproval }) => {
  // Mặc định: nếu course.approved === undefined thì là false (chưa duyệt)
  const [isApproved, setIsApproved] = useState(course.approved ?? false);
  const navigate = useNavigate();
  // Sync state với props khi course.approved thay đổi
  useEffect(() => {
    setIsApproved(course.approved ?? false);
  }, [course.approved]);

  const handleToggle = (e) => {
    e.stopPropagation();
    const newApproved = !isApproved;
    setIsApproved(newApproved);

    // Gọi callback để cập nhật trong parent
    if (onToggleApproval) {
      onToggleApproval(course.id, newApproved);
    }
  };
  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
  };
  return (
    <div
      className="course-card"
      style={{ cursor: "default" }}
      onClick={handleCardClick}
    >
      {/* Ảnh */}
      <div className="course-image-container">
        <img src={course.image} alt={course.title} className="course-image" />
        <div className="course-category">{course.category}</div>
      </div>

      {/* Nội dung */}
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.shortDescription}</p>

        {/* Footer */}
        <div className="course-footer">
          <div className="course-instructor">
            <span className="instructor-badge">👨‍🏫 {course.teacherName}</span>
          </div>

          <CourseStats course={course} />
          <div className="course-price-level">
            <p className="course-price">{course.price.toLocaleString()} VNĐ</p>
            <span className="level-badge">{course.level || "Cơ bản"}</span>
          </div>

          <div className="course-actions admin-actions">
            {/* Button trái: Hiển thị trạng thái (không thể bấm) */}
            <button
              className={`admin-status-btn ${
                isApproved ? "approved" : "pending"
              }`}
              disabled
            >
              {isApproved ? (
                <>
                  <Check className="action-icon" size={16} />
                  Đã duyệt
                </>
              ) : (
                <>
                  <X className="action-icon" size={16} />
                  Chưa duyệt
                </>
              )}
            </button>

            {/* Button phải: Toggle giữa Duyệt khóa học và Hạn chế */}
            <button
              className={`admin-toggle-btn ${
                isApproved ? "restrict" : "approve"
              }`}
              onClick={handleToggle}
            >
              {isApproved ? (
                <>
                  <Pencil className="action-icon" size={16} />
                  Hạn chế
                </>
              ) : (
                <>
                  <Check className="action-icon" size={16} />
                  Duyệt khóa học
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCard;
