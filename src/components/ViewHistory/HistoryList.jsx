import React from "react";
import HistoryItem from "./HistoryItem";

const HistoryList = ({ courses, onViewDetails }) => {
  // ✅ Xử lý trường hợp courses undefined hoặc không phải array
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return null;
  }

  return (
    <div className="history-grid">
      {courses.map((course, index) => (
        <HistoryItem
          key={course.id || course.courseId || index}
          course={course}
          index={index}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default HistoryList;
