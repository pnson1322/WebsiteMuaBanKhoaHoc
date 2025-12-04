import React from "react";
import { Eye } from "lucide-react";

const HistoryItem = ({ course, index, onViewDetails }) => {
  // ✅ Xử lý cả 2 cấu trúc dữ liệu: từ API và từ mock
  const courseName = course?.title || course?.name || "Khóa học";
  const courseImage =
    course?.imageUrl ||
    course?.image ||
    "https://via.placeholder.com/300x200?text=No+Image";
  const instructorName =
    course?.teacherName || course?.instructor?.name || "Giảng viên";
  const categoryName = course?.categoryName || course?.category || "Danh mục";
  const coursePrice = course?.price || 0;

  return (
    <div className="history-item" onClick={() => onViewDetails(course)}>
      <div className="history-index">{index + 1}</div>
      <img src={courseImage} alt={courseName} className="history-image" />
      <div className="history-content">
        <h4 className="history-title">{courseName}</h4>
        <p className="history-instructor">{instructorName}</p>
        <div className="history-meta">
          <span className="history-category">{categoryName}</span>
          <span className="history-price">
            {coursePrice.toLocaleString()} VNĐ
          </span>
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
