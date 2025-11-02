import React from "react";
import HistoryItem from "./HistoryItem";

const HistoryList = ({ courses, onViewDetails }) => {
  return (
    <div className="history-grid">
      {courses.map((course, index) => (
        <HistoryItem
          key={course.id}
          course={course}
          index={index}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default HistoryList;
