import React, { useState, useCallback, useMemo } from "react";
import { Check, X } from "lucide-react";
import "../CourseCard/CourseCard.css";
import CourseStats from "../../components/CourseCard/CourseStats";
import { getLevelInVietnamese } from "../../utils/courseUtils";
import "./AdminCourseCard.css";

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=Course";

const AdminCourseCard = React.memo(
  ({ course, onToggleApproval, onClick, priority = false }) => {
    const isApproved = course.isApproved ?? false;
    const isRestricted = course.isRestricted ?? false;

    /* ================= IMAGE LOGIC (GIỐNG CourseImageSection) ================= */
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const imageUrl = course.imageUrl || course.image;
    const categoryName = course.categoryName || "Khóa học";
    const title = course.title;

    const apiBase = useMemo(() => {
      const base =
        import.meta.env.VITE_IMAGE_BASE_URL ||
        import.meta.env.VITE_BASE_URL ||
        "";
      return base.endsWith("/") ? base.slice(0, -1) : base;
    }, []);

    const optimizedSrc = useMemo(() => {
      const raw = (imageUrl || "").trim();
      if (!raw) return FALLBACK_IMAGE;

      const withBase = /^https?:\/\//i.test(raw)
        ? raw
        : apiBase
        ? `${apiBase}${raw.startsWith("/") ? "" : "/"}${raw}`
        : raw;

      // Optimize Unsplash
      if (
        withBase.includes("unsplash.com") &&
        !withBase.includes("auto=format")
      ) {
        const sep = withBase.includes("?") ? "&" : "?";
        return `${withBase}${sep}auto=format&fit=crop&w=640&q=70`;
      }

      return withBase;
    }, [apiBase, imageUrl]);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoaded(true);
    }, []);

    const imageSrc = hasError ? FALLBACK_IMAGE : optimizedSrc;
    /* ========================================================================== */

    const handleToggle = (e) => {
      e.stopPropagation();
      onToggleApproval?.(course.id, isApproved, isRestricted);
    };

    const handleCardClick = () => {
      onClick?.(course);
    };

    return (
      <div
        className="course-card"
        style={{ cursor: "pointer" }}
        onClick={handleCardClick}
      >
        {/* ================= IMAGE ================= */}
        <div className="course-image-container">
          {!isLoaded && <div className="course-image-skeleton" />}

          <img
            src={imageSrc}
            alt={title}
            className={`course-image ${isLoaded ? "loaded" : "loading"}`}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 90vw"
          />

          <div className="course-category">{categoryName}</div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="course-content">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-description">
            {course.shortDescription || course.description || ""}
          </p>

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
              {isRestricted ? (
                <>
                  <button className="admin-status-btn restricted" disabled>
                    <X className="action-icon" size={16} />
                    Bị hạn chế
                  </button>
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
  }
);

AdminCourseCard.displayName = "AdminCourseCard";

export default AdminCourseCard;
