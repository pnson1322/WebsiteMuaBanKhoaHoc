import React from "react";
import { useAppState } from "../contexts/AppContext";
import CourseCard from "./CourseCard/CourseCard";
import "./LazyLoadCourses.css";

const LazyLoadCourses = ({ onViewDetails }) => {
  const { filteredCourses, isLoadingSuggestions, error } = useAppState();

  if (error) return <p className="error">Lỗi: {error}</p>;
  if (isLoadingSuggestions) return <p>Đang tải khóa học...</p>;

  return (
    <div className="courses-grid">
      {filteredCourses && filteredCourses.length > 0 ? (
        filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onViewDetails={onViewDetails}
          />
        ))
      ) : (
        <p>Không có khóa học phù hợp.</p>
      )}
    </div>
  );
};

export default LazyLoadCourses;
