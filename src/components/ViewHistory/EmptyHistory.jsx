import React from "react";
import { Eye } from "lucide-react";

const EmptyHistory = () => {
  return (
    <div className="empty-history">
      <Eye className="empty-icon" />
      <p>Chưa có lịch sử xem khóa học nào</p>
    </div>
  );
};

export default EmptyHistory;




