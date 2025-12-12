import React, { useState, useCallback } from "react";
import { Eye } from "lucide-react";
import "../CourseCard/CourseCard.css"; // Dùng lại style gốc
import CourseStats from "../../components/CourseCard/CourseStats";
import { getLevelInVietnamese } from "../../utils/courseUtils";
import { courseAPI } from "../../services/courseAPI";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1529101091764-c3526daf38fe";

const PurchasedCourseCard = React.memo(({ course, onViewDetails }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Xử lý image source với fallback
  const imageSrc = imageError
    ? DEFAULT_IMAGE
    : course.imageUrl || course.image || DEFAULT_IMAGE;

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
