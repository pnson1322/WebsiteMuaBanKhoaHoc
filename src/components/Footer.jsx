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
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../contexts/AppContext";

const Footer = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  // Lấy categories từ AppContext (đã được load sẵn)
  const categories = useMemo(() => {
    if (state.categories && state.categories.length > 0) {
      // Giới hạn 8 danh mục đầu tiên
      return state.categories.slice(0, 8);
    }
    return [];
  }, [state.categories]);

  const mid = Math.ceil(categories.length / 2);
  const col1 = categories.slice(0, mid);
  const col2 = categories.slice(mid);

  const handleCategoryClick = (categoryName) => {
    dispatch({ type: actionTypes.SET_CATEGORY, payload: categoryName });
    navigate("/");
    // Scroll to courses section
    setTimeout(() => {
      const coursesSection = document.getElementById("all-courses");
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

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
                <div
                  key={item.id || index}
                  className="category-item"
                  onClick={() => handleCategoryClick(item.name)}
                  style={{ cursor: "pointer" }}
                >
                  {item.name}
                </div>
              ))}
            </div>

            <div className="category-column">
              {col2.map((item, index) => (
                <div
                  key={item.id || index}
                  className="category-item"
                  onClick={() => handleCategoryClick(item.name)}
                  style={{ cursor: "pointer" }}
                >
                  {item.name}
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
