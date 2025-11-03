import React from "react";
import { BenefitsContent, BenefitItem, Testimonial } from "./Auth.styled";
import { Zap, Star, Check } from "lucide-react";
const AuthBenefits = () => (
  <BenefitsContent>
    <h2>🚀 Nâng tầm tri thức</h2>
    <p>Đăng nhập để trải nghiệm các tính năng độc quyền!</p>

    <div className="benefits-list">
      <BenefitItem>
        <div className="benefit-icon">
          <Zap size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h3>Lộ trình rõ ràng</h3>
          <p>Từng bước chinh phục kỹ năng bạn cần, từ cơ bản đến nâng cao.</p>
        </div>
      </BenefitItem>

      <BenefitItem>
        <div className="benefit-icon">
          <Star size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h3>Danh sách yêu thích</h3>
          <p>Lưu lại những khóa học bạn quan tâm.</p>
        </div>
      </BenefitItem>

      <BenefitItem>
        <div className="benefit-icon">
          <Check size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h3>Tiến độ học tập</h3>
          <p>Theo dõi lịch sử học tập và tiến độ cá nhân.</p>
        </div>
      </BenefitItem>
    </div>

    <Testimonial>
      <blockquote>
        “Khóa học rất thực tế và dễ hiểu — mình học được nhiều kỹ năng áp dụng
        ngay!”
      </blockquote>
      <cite>- Học viên EduMart</cite>
    </Testimonial>
  </BenefitsContent>
);

export default AuthBenefits;
