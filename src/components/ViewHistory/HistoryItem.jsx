import React from "react";
import { Eye } from "lucide-react";

const HistoryItem = ({ course, index, onViewDetails }) => {
  return (
    <div
      className="history-item"
      onClick={() => onViewDetails(course)}
    >
      <div className="history-index">{index + 1}</div>
      <img
        src={course.image}
        alt={course.name}
        className="history-image"
      />
      <div className="history-content">
        <h4 className="history-title">{course.name}</h4>
        <p className="history-instructor">{course.instructor}</p>
        <div className="history-meta">
          <span className="history-category">{course.category}</span>
          <span className="history-price">{course.price.toLocaleString()} VNĐ</span>
        </div>
      </div>
      <div className="history-overlay">
        <Eye className="view-icon" />
        <span>Xem lại</span>
      </div>
    </div>
  );
};

export default HistoryItem;
