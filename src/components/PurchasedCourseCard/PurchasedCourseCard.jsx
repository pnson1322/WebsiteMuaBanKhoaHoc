import React from "react";
import { Eye } from "lucide-react";
import "../CourseCard/CourseCard.css"; // Dùng lại style gốc
import CourseStats from "../../components/CourseCard/CourseStats";

const PurchasedCourseCard = ({ course, onViewDetails }) => {
  return (
    <div className="course-card" onClick={() => onViewDetails(course)}>
      {/* Ảnh */}
      <div className="course-image-container">
        <img src={course.image} alt={course.name} className="course-image" />
        <div className="course-category">{course.category}</div>
      </div>

      {/* Nội dung */}
      <div className="course-content">
        <h3 className="course-title">{course.name}</h3>
        <p className="course-description">{course.shortDescription}</p>

        {/* Footer */}
        <div className="course-footer">
          <div className="course-instructor">
            <span className="instructor-badge">👨‍🏫 {course.instructor}</span>
          </div>

          <CourseStats course={course} />
          <div className="course-price-level">
            <p className="course-price">{course.price.toLocaleString()} VNĐ</p>
            <span className="level-badge">{course.level || "Cơ bản"}</span>
          </div>

          <div className="course-actions">
            <button
              className="view-details-btn"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(course);
              }}
            >
              <Eye className="action-icon" /> Xem thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedCourseCard;
