import {
  BookOpen,
  Facebook,
  Linkedin,
  TwitterIcon,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import "./Footer.css";
import { useEffect, useState } from "react";
import axios from "axios";

const Footer = () => {
  const [categories, setCategories] = useState([
    "Lập Trình Web",
    "Data Science",
    "Thiết Kế UI/UX",
    "Tài Chính",
    "Mobile App",
    "Digital Marketing",
    "Kinh Doanh",
    "Ngoại Ngữ",
  ]);

  //   useEffect(() => {
  //     axios
  //       .get("...")
  //       .then((data) => {
  //         const limitedData = data.slice(0, 8);
  //         setCategories(limitedData);
  //       })
  //       .catch((err) => console.error("Lỗi khi lấy categories:", err));
  //   }, []);

  const mid = Math.ceil(categories.length / 2);
  const col1 = categories.slice(0, mid);
  const col2 = categories.slice(mid);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <p className="footer-logo-label">
            <div className="icon-wrapper">
              <BookOpen className="footer-logo-icon" />
            </div>
            Edumart
          </p>

          <p className="footer-text">
            Nền tảng học trực tuyến hàng đầu Việt Nam với hơn 10,000 khóa học
            chất lượng cao từ các chuyên gia trong ngành.
          </p>

          <div className="footer-logos">
            <div className="icon-wrapper outside-logo">
              <TwitterIcon className="footer-logo-icon" />
            </div>

            <div className="icon-wrapper outside-logo">
              <Facebook className="footer-logo-icon" />
            </div>

            <div className="icon-wrapper outside-logo">
              <Linkedin className="footer-logo-icon" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="column-title">Danh Mục Khóa Học</h3>

          <div className="category-columns">
            <div className="category-column">
              {col1.map((item, index) => (
                <div key={index} className="category-item">
                  {item}
                </div>
              ))}
            </div>

            <div className="category-column">
              {col2.map((item, index) => (
                <div key={index} className="category-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="column-title">Thông tin liên hệ</h3>

          <div className="contact-item">
            <MapPin className="contact-icon" />
            <p className="contact-text">
              Khu phố 6, Phường Linh Trung, Thành phố Thủ Đức, TP. HCM
            </p>
          </div>

          <div className="contact-item">
            <Phone className="contact-icon" />
            <a href="tel:+84 945 784 041" className="contact-text">
              +84 945 784 041
            </a>
          </div>

          <div className="contact-item">
            <Mail className="contact-icon" />
            <a href="mailto:23521348@gm.uit.edu.vn" className="contact-text">
              23521348@gm.uit.edu.vn
            </a>
          </div>
        </div>
      </div>

      <div className="right-policy">
        <p className="right">© 2025 EduMart. Tất cả quyền được bảo lưu.</p>

        <div className="policy">
          <div className="policy-item">Chính Sách Bảo Mật</div>
          <div className="policy-item">Điều khoản sử dụng</div>
          <div className="policy-item">Chính Sách Hoàn Tiền</div>
          <div className="policy-item">Hỗ Trợ</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
