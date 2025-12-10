import "./Cart.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { CourseCardSkeleton } from "../components/LoadingSkeleton";
import PaymentPopup from "../components/PaymentPopup";
import { cartAPI } from "../services/cartAPI";
import { getLevelInVietnamese } from "../utils/courseUtils";

const Cart = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { removeFromCart, clearCart } = useAppDispatch();

  const [cartCourses, setCartCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  // useEffect(() => {
  //   try {
  //     if (!state.courses) {
  //       setLoading(true);
  //       return;
  //     }

  //     const filtered = state.courses.filter((c) => state.cart.includes(c.id));
  //     setCartCourses(filtered);
  //     console.log(cartCourses);
  //     setLoading(false);
  //   } catch (err) {
  //     setError("Không thể tải giỏ hàng!");
  //     setLoading(false);
  //   }
  // }, [state.courses, state.cart]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await cartAPI.getCart();
        setCartCourses(res);
        console.log(cartCourses);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải giỏ hàng!" + err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const closePopup = () => setShowPayment(false);

  const toggleSelect = (courseId) => {
    setSelectedIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleViewDetails = (course) => {
    navigate(`/course/${course.id}`);
  };

  const handleRemoveItem = async (courseId) => {
    console.log(courseId);
    const result = await removeFromCart(courseId);
    if (result.success) {
      setSelectedIds((prev) => prev.filter((id) => id !== courseId));
    } else {
      alert("Có lỗi khi xóa sản phẩm!");
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả?")) {
      const result = await clearCart();
      if (result.success) {
        setSelectedIds([]);
      } else {
        alert("Lỗi khi xóa giỏ hàng");
      }
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const selectedCourses = cartCourses.filter((c) => selectedIds.includes(c.id));
  const selectedCount = selectedCourses.length;
  const totalPrice = selectedCourses.reduce(
    (sum, course) => sum + course.price,
    0
  );

  if (loading) {
    return (
      <div className="cart-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>

          <div className="cart-header">
            <div className="cart-title">
              <ShoppingCart className="cart-icon" />
              <h1>Giỏ hàng của bạn</h1>
            </div>
          </div>

          <div className="cart-items">
            {[1, 2, 3].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>

          <div className="error-page">
            <div className="error-content">
              <h2>⚠️ Có lỗi xảy ra</h2>
              <p>{error}</p>
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-transition">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft className="back-icon" />
          <span>Quay lại</span>
        </button>

        <div className="cart-header">
          <div className="cart-title">
            <ShoppingCart className="cart-icon" />
            <h1>Giỏ hàng của bạn</h1>
            <span className="cart-count">({cartCourses.length})</span>
          </div>

          {cartCourses.length > 0 && (
            <button className="clear-cart-btn" onClick={handleClearCart}>
              <Trash2 className="trash-icon" />
              Xóa tất cả
            </button>
          )}
        </div>

        {console.log("in ra cartCourses trước khi render")}
        {console.log(cartCourses)}
        {cartCourses.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart className="empty-icon" />
            <h3>Giỏ hàng trống</h3>
            <p>
              Hãy thêm các khóa học bạn quan tâm vào giỏ hàng để thanh toán!
            </p>
            <button
              className="browse-courses-btn"
              onClick={() => navigate("/")}
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartCourses.map((course) => (
                <div key={course.id} className="cart-item">
                  <input
                    type="checkbox"
                    className="cart-item-checkbox"
                    checked={selectedIds.includes(course.id)}
                    onChange={() => toggleSelect(course.id)}
                  />

                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="cart-item-image"
                  />

                  <div className="cart-item-info">
                    <h3 className="cart-item-title">{course.title}</h3>
                    <p className="cart-item-instructor">
                      👨‍🏫 {course.teacherName}
                    </p>
                    <p className="cart-item-description">
                      {course.description}
                    </p>
                    <div className="cart-item-details">
                      <span className="cart-item-category">
                        {course.categoryName}
                      </span>
                      <span className="cart-item-level">
                        {getLevelInVietnamese(course.level)}
                      </span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-item-price">
                      {formatPrice(course.price)}
                    </div>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(course)}
                    >
                      <BookOpen className="view-icon" />
                      Xem chi tiết
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(course.id)}
                    >
                      <Trash2 className="remove-icon" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-content">
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Tổng số khóa học thanh toán:</span>
                    <span className="summary-value">{selectedCount} khóa</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí dịch vụ:</span>
                    <span className="summary-value">Miễn phí</span>
                  </div>
                  <div className="summary-row total">
                    <span>Tổng tiền:</span>
                    <span className="summary-value">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  className="checkout-btn"
                  disabled={selectedIds.length === 0}
                  style={{
                    cursor:
                      selectedIds.length === 0 ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (selectedIds.length === 0) return;
                    setShowPayment(true);
                  }}
                >
                  <CreditCard className="checkout-icon" />
                  Thanh toán ngay
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showPayment && (
        <PaymentPopup onClose={closePopup} course={selectedCourses} />
      )}
    </div>
  );
};

export default Cart;
