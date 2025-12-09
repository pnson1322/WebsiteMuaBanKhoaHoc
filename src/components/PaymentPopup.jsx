import { CreditCard, X, Loader2 } from "lucide-react";
import "./PaymentPopup.css";
import momo from "../assets/momo.png";
import { useState } from "react";
import { momoAPI } from "../services/momoAPI";
import { useToast } from "../contexts/ToastContext";

const PaymentPopup = ({ onClose, course }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const selectedCount = course.length;
  const totalPrice = course.reduce((sum, course) => sum + course.price, 0);

  const handlePayment = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const courseIds = course.map((item) => item.id);
      const amount = totalPrice;

      const data = await momoAPI.createMomoPayment({ courseIds, amount });

      if (data && data.payUrl) {
        sessionStorage.setItem("paying_course_ids", JSON.stringify(courseIds));

        window.location.href = data.payUrl;
      } else {
        showError("Không nhận được liên kết thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      const message =
        error.response?.data?.message || error.message || "Có lỗi xảy ra";
      showError("Lỗi thanh toán: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment" onClick={(e) => e.stopPropagation()}>
        <div className="title-section-popup">
          <CreditCard />

          <div>Thanh toán</div>

          <X className="cancel-icon" onClick={onClose} />
        </div>

        <div className="payment-section">
          <div className="course-info">
            <h3>📋 Đơn Hàng Của Bạn</h3>

            {course.map((item) => {
              return (
                <div className="course-item">
                  <div className="course-name">{item.title}</div>

                  <div className="course-price">{formatPrice(item.price)}</div>
                </div>
              );
            })}

            <div className="course-count">{selectedCount + " "} khóa học</div>

            <div className="price">
              <div className="price-text">Tổng cộng:</div>
              <div className="price-total">{formatPrice(totalPrice)}</div>
            </div>
          </div>

          <div className="payment-method">
            <h3>💰 Phương Thức Thanh Toán</h3>

            <div className="method">
              <img src={momo} alt="MoMo logo" className="method-icon" />

              <div className="method-name">Thanh toán qua Ví MoMo</div>
            </div>

            <button
              className="checkout-btn payment-btn"
              onClick={handlePayment}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="checkout-icon animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="checkout-icon" />
                  Thanh toán ngay
                </>
              )}
            </button>

            <div className="course-count payment-text">
              🔒 Cam kết thanh toán được bảo mật an toàn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;
