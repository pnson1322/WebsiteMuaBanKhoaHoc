import React from "react";
import { BenefitsContent, BenefitItem, Testimonial } from "./Auth.styled";

const AuthBenefits = () => (
  <BenefitsContent>
    <h2>🚀 Khám phá sức mạnh AI</h2>
    <p>Đăng nhập để trải nghiệm các tính năng độc quyền!</p>

    <div className="benefits-list">
      <BenefitItem>
        <div className="benefit-icon">🤖</div>
        <div>
          <h3>AI Gợi ý khóa học</h3>
          <p>Được đề xuất khóa học phù hợp nhất với bạn.</p>
        </div>
      </BenefitItem>
      <BenefitItem>
        <div className="benefit-icon">⭐</div>
        <div>
          <h3>Danh sách yêu thích</h3>
          <p>Lưu lại những khóa học bạn quan tâm.</p>
        </div>
      </BenefitItem>
    </div>

    <Testimonial>
      <blockquote>
        “AI giúp tôi tìm được đúng khóa học mình cần. Rất tuyệt vời!”
      </blockquote>
      <cite>- Học viên EduMart</cite>
    </Testimonial>
  </BenefitsContent>
);

export default AuthBenefits;
