import React from "react";
import { Heart } from "lucide-react";

const CourseImageSection = ({ course, isFavorite, onToggleFavorite }) => {
  return (
    <div className="course-image-container">
      <img src={course.image} alt={course.name} className="course-image" />
      <div className="course-category">{course.level}</div>
      <button
        className={`favorite-button ${isFavorite ? "favorite" : ""}`}
        onClick={onToggleFavorite}
      >
        <Heart className="heart-icon" />
      </button>
    </div>
  );
};

export default CourseImageSection;
