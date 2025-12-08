import React from "react";
import { Heart } from "lucide-react";

const CourseImageSection = React.memo(
  ({ course, isFavorite, onToggleFavorite, showFavoriteButton = true }) => {
    return (
      <div className="course-image-container">
        <img
          src={
            course.imageUrl ||
            "https://images.unsplash.com/photo-1529101091764-c3526daf38fe"
          }
          alt={course.title}
          className="course-image"
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
