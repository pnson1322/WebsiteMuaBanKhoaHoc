import React, { useState, useCallback, useMemo } from "react";
import { Heart } from "lucide-react";

const CourseImageSection = React.memo(
  ({
    course,
    isFavorite,
    onToggleFavorite,
    showFavoriteButton = true,
    priority = false,
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Lấy imageUrl và categoryName một lần
    const imageUrl = course.imageUrl || course.image;
    const categoryName = course.categoryName;
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
      if (!raw) {
        return "https://placehold.co/600x400?text=Course";
      }

      const withBase = /^https?:\/\//i.test(raw)
        ? raw
        : apiBase
        ? `${apiBase}${raw.startsWith("/") ? "" : "/"}${raw}`
        : raw;

      // Thêm tham số giảm chất lượng cho ảnh Unsplash để tải nhanh hơn
      if (
        withBase.includes("unsplash.com") &&
        !withBase.includes("auto=format")
      ) {
        const separator = withBase.includes("?") ? "&" : "?";
        return `${withBase}${separator}auto=format&fit=crop&w=640&q=70`;
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

    const imageSrc = hasError
      ? "https://placehold.co/600x400?text=Course"
      : optimizedSrc;

    return (
      <div className="course-image-container">
        {/* Placeholder skeleton khi chưa load */}
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

        {showFavoriteButton && (
          <button
            className={`favorite-button ${isFavorite ? "favorite" : ""}`}
            onClick={onToggleFavorite}
          >
            <Heart className="heart-icon" />
          </button>
        )}
      </div>
    );
  },
  // Custom comparator - chỉ re-render khi props quan trọng thay đổi
  (prevProps, nextProps) => {
    return (
      prevProps.course.id === nextProps.course.id &&
      prevProps.course.imageUrl === nextProps.course.imageUrl &&
      prevProps.course.image === nextProps.course.image &&
      prevProps.course.categoryName === nextProps.course.categoryName &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.showFavoriteButton === nextProps.showFavoriteButton &&
      prevProps.priority === nextProps.priority
    );
  }
);

CourseImageSection.displayName = "CourseImageSection";

export default CourseImageSection;
