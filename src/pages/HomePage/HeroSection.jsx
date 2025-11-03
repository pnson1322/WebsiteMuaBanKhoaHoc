import React from "react";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>🎓 Chào mừng đến EduMart</h1>
        <p>
          Khám phá hàng nghìn khóa học chất lượng cao từ các giảng viên hàng
          đầu.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Khóa học</span>
          </div>
          <div className="stat">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Học viên</span>
          </div>
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Giảng viên</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;




