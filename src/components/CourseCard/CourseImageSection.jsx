import React, { useState, useCallback } from "react";
import { Heart } from "lucide-react";

const CourseImageSection = React.memo(
  ({ course, isFavorite, onToggleFavorite, showFavoriteButton = true }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoaded(true);
    }, []);

    const imageSrc = hasError
      ? "https://images.unsplash.com/photo-1529101091764-c3526daf38fe"
      : course.imageUrl ||
        "https://images.unsplash.com/photo-1529101091764-c3526daf38fe";

    return (
      <div className="course-image-container">
        {/* Placeholder skeleton khi chưa load */}
        {!isLoaded && <div className="course-image-skeleton" />}
        <img
          src={imageSrc}
          alt={course.title}
          className={`course-image ${isLoaded ? "loaded" : "loading"}`}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />

        <div className="course-category">{course.categoryName}</div>

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
  }
);

export default CourseImageSection;
