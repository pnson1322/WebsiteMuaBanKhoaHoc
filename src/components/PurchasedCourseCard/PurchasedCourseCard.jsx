import React, { useState } from "react";
import { Eye } from "lucide-react";
import "../CourseCard/CourseCard.css"; // Dùng lại style gốc
import CourseStats from "../../components/CourseCard/CourseStats";
import { getLevelInVietnamese } from "../../utils/courseUtils";
import { courseAPI } from "../../services/courseAPI";

const PurchasedCourseCard = React.memo(({ course, onViewDetails }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleViewLecture = async (e) => {
    e.stopPropagation();

    // Nếu đã có courseLecture thì mở luôn
    if (course.courseLecture) {
      window.open(course.courseLecture, "_blank");
      return;
    }

    // Nếu chưa có thì gọi API để lấy
    setIsLoading(true);
    try {
      const courseDetail = await courseAPI.getCourseById(course.id);
      if (courseDetail?.courseLecture) {
        window.open(courseDetail.courseLecture, "_blank");
      } else {
        alert("Khóa học này chưa có link bài giảng!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin khóa học:", error);
      alert("Có lỗi xảy ra khi tải thông tin khóa học!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="course-card" onClick={() => onViewDetails(course)}>
      {/* Ảnh */}
      <div className="course-image-container">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="course-image"
        />
        <div className="course-category">{course.categoryName}</div>
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
            <span className="level-badge">
              {getLevelInVietnamese(course.level)}
            </span>
          </div>

          <div className="course-actions">
            <button
              className="view-details-btn"
              onClick={handleViewLecture}
              disabled={isLoading}
            >
              <Eye className="action-icon" />{" "}
              {isLoading ? "Đang tải..." : "Xem thêm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PurchasedCourseCard;
