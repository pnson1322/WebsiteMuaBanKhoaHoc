import React from "react";
import { ShoppingCart, Eye } from "lucide-react";

const CourseFooter = ({ course, isInCart, onAddToCart, onViewDetails }) => {
  return (
    <div className="course-footer">
      <div className="course-price-level">
        <p className="course-price">{course.price.toLocaleString()} VNĐ</p>
        <span className="level-badge">{course.level || "Cơ bản"}</span>
      </div>

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


