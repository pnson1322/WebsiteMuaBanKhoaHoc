import React from "react";
import { ShoppingCart, Eye, Clock } from "lucide-react";

const CourseFooter = ({ course, isInCart, onAddToCart, onViewDetails }) => {
  return (
    <div className="course-footer">
      {/* 👨‍🏫 Instructor info */}
      <div className="course-instructor">
        <span className="instructor-badge">
          👨‍🏫 {course.instructor?.name ?? "Giảng viên ẩn danh"}
        </span>
      </div>

      {/* 💰 Price + Level + Duration */}
      <div className="course-price-level">
        <p className="course-price">
          {typeof course?.price === "number"
            ? new Intl.NumberFormat("vi-VN").format(course.price) + " VNĐ"
            : "0 VNĐ"}
        </p>
        <div className="course-meta">
          <span className="level-badge">{course.level || "Cơ bản"}</span>
        </div>
      </div>

      {/* 🎯 Actions */}
      <div className="course-actions">
        <button
          className={`add-to-cart-btn ${isInCart ? "in-cart" : ""}`}
          onClick={onAddToCart}
          disabled={isInCart}
        >
          <ShoppingCart className="action-icon" />
          {isInCart ? "Đã thêm" : "Thêm vào giỏ"}
        </button>
        <button className="view-details-btn" onClick={onViewDetails}>
          <Eye className="action-icon" />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default CourseFooter;
