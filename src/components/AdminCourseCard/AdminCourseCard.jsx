import React, { useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import "../CourseCard/CourseCard.css";
import CourseStats from "../../components/CourseCard/CourseStats";
import { getLevelInVietnamese } from "../../utils/courseUtils";
import "./AdminCourseCard.css";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1529101091764-c3526daf38fe";

const AdminCourseCard = React.memo(({ course, onToggleApproval, onClick }) => {
  const isApproved = course.isApproved ?? false;
  const isRestricted = course.isRestricted ?? false;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const imageSrc = imageError
    ? DEFAULT_IMAGE
    : course.imageUrl || course.image || DEFAULT_IMAGE;

  const handleToggle = (e) => {
    e.stopPropagation();

    // Gọi callback để cập nhật trong parent
    if (onToggleApproval) {
      onToggleApproval(course.id, isApproved, isRestricted);
    }
  };
  const handleCardClick = () => {
    if (onClick) {
      onClick(course);
    }
  };
  return (
    <div
      className="course-card"
      style={{ cursor: "pointer" }}
      onClick={handleCardClick}
    >
      {/* Ảnh */}
      <div className="course-image-container">
        {!imageLoaded && <div className="course-image-skeleton" />}
        <img
          src={imageSrc}
          alt={course.title}
          className={`course-image ${imageLoaded ? "loaded" : "loading"}`}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="course-category">
          {course.categoryName || "Khóa học"}
        </div>
      </div>

      {/* Nội dung */}
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">
          {course.shortDescription || course.description || ""}
        </p>

        {/* Footer */}
        <div className="course-footer">
          <div className="course-instructor">
            <span className="instructor-badge">
              👨‍🏫 {course.teacherName || "Giảng viên"}
            </span>
          </div>

          <CourseStats course={course} />
          <div className="course-price-level">
            <p className="course-price">
              {(course.price || 0).toLocaleString()} VNĐ
            </p>
            <span className="level-badge">
              {getLevelInVietnamese(course.level)}
            </span>
          </div>

          <div className="course-actions admin-actions">
            {/* Nếu bị hạn chế: hiển thị trạng thái và nút Bỏ hạn chế */}
            {isRestricted ? (
              <>
                {/* Button trái: Hiển thị trạng thái bị hạn chế (không thể bấm) */}
                <button className="admin-status-btn restricted" disabled>
                  <X className="action-icon" size={16} />
                  Bị hạn chế
                </button>

                {/* Button phải: Bỏ hạn chế */}
                <button
                  className="admin-toggle-btn approve"
                  onClick={handleToggle}
                >
                  <Check className="action-icon" size={16} />
                  Bỏ hạn chế
                </button>
              </>
            ) : (
              <>
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
                      <X className="action-icon" size={16} />
                      Hạn chế
                    </>
                  ) : (
                    <>
                      <Check className="action-icon" size={16} />
                      Duyệt khóa học
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminCourseCard;
