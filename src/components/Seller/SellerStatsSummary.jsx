import React from "react";
import { BookText, ChartArea, Star, UserRound } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const SellerStatsSummary = ({
  totalCourses = 0,
  totalStudents = 0,
  totalRevenue = 0,
  averageRating = 0,
}) => {
  return (
    <div className="text-chart">
      <div className="text-chart-item">
        <div className="text-chart-stats">
          <div className="text-chart-text">Tổng khóa học</div>
          <div className="text-chart-number">{totalCourses}</div>
        </div>

        <div className="text-chart-icon-wrapper" style={{ background: "#dbeafe" }}>
          <BookText className="text-chart-icon" style={{ color: "#2563eb" }} />
        </div>
      </div>

      <div className="text-chart-item">
        <div className="text-chart-stats">
          <div className="text-chart-text">Học viên</div>
          <div className="text-chart-number">{totalStudents}</div>
        </div>

        <div className="text-chart-icon-wrapper" style={{ background: "#dcfce7" }}>
          <UserRound className="text-chart-icon" style={{ color: "#16a34a" }} />
        </div>
      </div>

      <div className="text-chart-item">
        <div className="text-chart-stats">
          <div className="text-chart-text">Doanh thu</div>
          <div className="text-chart-number">{formatPrice(totalRevenue)}</div>
        </div>

        <div className="text-chart-icon-wrapper" style={{ background: "#fef9c3" }}>
          <ChartArea className="text-chart-icon" style={{ color: "#ca8a04" }} />
        </div>
      </div>

      <div className="text-chart-item">
        <div className="text-chart-stats">
          <div className="text-chart-text">Đánh giá trung bình</div>
          <div className="text-chart-number">{Number(averageRating) > 0 ? Number(averageRating).toFixed(1) : "--"}</div>
        </div>

        <div className="text-chart-icon-wrapper" style={{ background: "#f3e8ff" }}>
          <Star className="text-chart-icon" style={{ color: "#9333ea" }} />
        </div>
      </div>
    </div>
  );
};

export default SellerStatsSummary;





