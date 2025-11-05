import { useNavigate, useParams } from "react-router-dom";
import "./CourseDetail.css";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Heart,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../services/api"; // ✅ lấy mockCourse từ api.js

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { showSuccess, showFavorite, showUnfavorite } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Lấy dữ liệu khóa học từ mock API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await coursesAPI.getCourseById(Number(id));
        if (data) setCourse(data);
        else setError("Không tìm thấy khóa học");
      } catch (err) {
        setError("Lỗi khi tải khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="loading-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-content"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>❌ Lỗi</h2>
            <p>{error || "Không tìm thấy khóa học"}</p>
            <button onClick={() => navigate("/")} className="back-home-btn">
              <ArrowLeft /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFavorite = state.favorites.includes(course.id);
  const isInCart = state.cart.includes(course.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch({ type: actionTypes.REMOVE_FROM_FAVORITES, payload: course.id });
      showUnfavorite(`💔 Đã bỏ yêu thích "${course.name}"`);
    } else {
      dispatch({ type: actionTypes.ADD_TO_FAVORITES, payload: course.id });
      showFavorite(`❤️ Đã thêm "${course.name}" vào danh sách yêu thích!`);
    }
  };

  const handleAddToCart = () => {
    if (!isInCart) {
      dispatch({ type: actionTypes.ADD_TO_CART, payload: course.id });
      showSuccess(`🛒 Đã thêm "${course.name}" vào giỏ hàng!`);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="course-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft />
          <span>Quay lại</span>
        </button>

        <div className="course-header">
          {/* Image + Instructor */}
          <div className="course-image-section">
            <img
              src={course.image}
              alt={course.name}
              className="course-main-image"
            />
            <div className="course-category-badge">{course.category}</div>

            <div className="course-instructor">
              <div>
                👨‍🏫 Giảng viên: <strong>{course.instructor?.name}</strong>
              </div>
              <div>
                📧 Email:{" "}
                <strong>
                  <a href={"mailto:" + course.instructor?.email}>
                    {course.instructor?.email}
                  </a>
                </strong>
              </div>
              <div>
                📞 Số điện thoại:{" "}
                <strong>
                  <a href={"tel:" + course.instructor?.phone}>
                    {course.instructor?.phone}
                  </a>
                </strong>
              </div>
            </div>
          </div>

          {/* Course info */}
          <div className="course-info-section">
            <h1 className="course-title">{course.name}</h1>
            <p className="course-description">{course.description}</p>

            <div className="course-stats-grid">
              <div className="stat-item">
                <Star className="stat-icon" />
                <div>
                  <span className="stat-value">{course.rating}</span>
                  <span className="stat-label">Đánh giá</span>
                </div>
              </div>
              <div className="stat-item">
                <Users className="stat-icon" />
                <div>
                  <span className="stat-value">
                    {course.students.toLocaleString()}
                  </span>
                  <span className="stat-label">Học viên</span>
                </div>
              </div>
              <div className="stat-item">
                <Clock className="stat-icon" />
                <div>
                  <span className="stat-value">{course.duration}</span>
                  <span className="stat-label">Thời lượng</span>
                </div>
              </div>
              <div className="stat-item">
                <Award className="stat-icon" />
                <div>
                  <span className="stat-value">{course.level}</span>
                  <span className="stat-label">Trình độ</span>
                </div>
              </div>
            </div>

            <div className="course-price-section">
              <span className="price-label">Giá khóa học:</span>
              <span className="price-value">{formatPrice(course.price)}</span>
            </div>

            <div className="course-actions">
              <button
                className={`favorite-btn ${isFavorite ? "favorited" : ""}`}
                onClick={handleToggleFavorite}
              >
                <Heart className="action-icon" />
                {isFavorite ? "Đã yêu thích" : "Yêu thích"}
              </button>

              <button
                className={`cart-btn ${isInCart ? "in-cart" : ""}`}
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                <ShoppingCart className="action-icon" />
                {isInCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>
        </div>

        {/* Nội dung khóa học */}
        <div className="course-content">
          <div className="content-section">
            <h2>📖 Nội dung khóa học</h2>
            <div className="content-list">
              {course.contentList?.map((item, idx) => (
                <div className="content-item" key={idx}>
                  <BookOpen className="content-icon" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.des}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2>🎯 Đối tượng học viên</h2>
            <ul className="target-list">
              {course.intendedLearners?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>💪 Kỹ năng đạt được</h2>
            <div className="skills-grid">
              {course.skillsAcquired?.map((skill, i) => (
                <span className="skill-tag" key={i}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
