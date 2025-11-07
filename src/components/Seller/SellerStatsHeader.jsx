import React from "react";

const SellerStatsHeader = ({
  title = "📊 Thống kê",
  subtitle = "Thống kê thông tin giao dịch khóa học của bạn",
}) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
};

export default SellerStatsHeader;
