import React from "react";
import { useAppState } from "../contexts/AppContext";
import CourseCard from "./CourseCard/CourseCard";
import "./LazyLoadCourses.css";

const LazyLoadCourses = ({ onViewDetails, CardComponent = CourseCard }) => {
  const {
    courses,
    filteredCourses,
    isLoadingSuggestions,
    error,
    searchTerm,
    selectedCategory,
    selectedPriceRange,
  } = useAppState();

  if (error) return <p className="error">Lỗi: {error}</p>;
  if (isLoadingSuggestions) return <p>Đang tải khóa học...</p>;

  const totalCourses = courses?.length || 0;
  const displayedCourses = filteredCourses?.length || 0;
  const hasActiveFilters =
    (searchTerm && searchTerm.trim() !== "") ||
    selectedCategory !== "Tất cả" ||
    (selectedPriceRange && selectedPriceRange.label !== "Tất cả");
  const showSummary = totalCourses > 0 || displayedCourses > 0;

  return (
    <div className="lazy-load-courses">
      {showSummary && (
        <div className="results-info">
          <p>
            Hiển thị {displayedCourses} trong số {totalCourses} khóa học
            {hasActiveFilters && totalCourses > 0
              ? ` - Có ${displayedCourses} khóa học phù hợp với bộ lọc hiện tại`
              : ""}
          </p>
        </div>
      )}

      <div className="courses-grid">
        {filteredCourses && filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CardComponent
              key={course.id}
              course={course}
              onViewDetails={onViewDetails}
            />
          ))
        ) : (
          <p>Không có khóa học phù hợp.</p>
        )}
      </div>

      {displayedCourses > 0 && (
        <div className="end-of-results">
          <p>
            {hasActiveFilters && displayedCourses !== totalCourses
              ? "Bạn đã xem hết tất cả khóa học phù hợp với bộ lọc hiện tại!"
              : "Bạn đã xem hết tất cả khóa học!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default LazyLoadCourses;
