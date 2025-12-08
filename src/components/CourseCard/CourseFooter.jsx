import React from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { getLevelInVietnamese } from "../../utils/courseUtils";

const CourseFooter = React.memo(
  ({ course, isInCart, onAddToCart, onViewDetails, showCartButton = true }) => {
    return (
      <div className="course-footer">
        {/* 👨‍🏫 Instructor info */}
        <div className="course-instructor">
          <span className="instructor-badge">
            👨‍🏫 {course.teacherName || "Giảng viên ẩn danh"}
          </span>
        </div>

        {/* 💰 Price + Level */}
        <div className="course-price-level">
          <p className="course-price">
            {new Intl.NumberFormat("vi-VN").format(course.price)} VNĐ
          </p>

          <div className="course-meta">
            <span className="level-badge">
              {getLevelInVietnamese(course.level)}
            </span>
          </div>
        </div>

        {/* 🎯 Actions */}
        <div className="course-actions">
          {showCartButton && (
            <button
              className={`add-to-cart-btn ${isInCart ? "in-cart" : ""}`}
              onClick={onAddToCart}
              disabled={isInCart}
            >
              <ShoppingCart className="action-icon" />
              {isInCart ? "Đã thêm" : "Thêm vào giỏ"}
            </button>
          )}

          <button className="view-details-btn" onClick={onViewDetails}>
            <Eye className="action-icon" />
            Xem chi tiết
          </button>
        </div>
      </div>
    );
  }
);

export default CourseFooter;
