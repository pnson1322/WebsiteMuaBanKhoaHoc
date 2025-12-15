import { CreditCard, X, Loader2, AlertCircle } from "lucide-react";
import "./PaymentPopup.css";
import momo from "../assets/momo.png";
import { useState, useMemo } from "react";
import { momoAPI } from "../services/momoAPI";
import { useToast } from "../contexts/ToastContext";

const PaymentPopup = ({ onClose, course }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const safeCourses = useMemo(() => {
    return Array.isArray(course) ? course : [];
  }, [course]);

  const selectedCount = safeCourses.length;
  const totalPrice = useMemo(() => {
    return safeCourses.reduce((sum, item) => sum + (item?.price || 0), 0);
  }, [safeCourses]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const isValidToPay = selectedCount > 0 && totalPrice > 0;

  const handlePayment = async () => {
    if (isLoading || !isValidToPay) return;

    setIsLoading(true);
    try {
      const courseIds = safeCourses.map((item) => item.id);

      const data = await momoAPI.createMomoPayment({
        courseIds,
        amount: totalPrice,
      });

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
          {/* Cột trái: Thông tin đơn hàng */}
          <div className="course-info">
            <h3>📋 Đơn Hàng Của Bạn</h3>

            {selectedCount === 0 ? (
              <div
                className="empty-payment-state"
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                <AlertCircle
                  size={40}
                  style={{ margin: "0 auto 10px", color: "#f59e0b" }}
                />
                <p>Không tìm thấy thông tin khóa học.</p>
                <p style={{ fontSize: "0.85rem" }}>Vui lòng thử lại sau.</p>
              </div>
            ) : (
              <div
                className="course-list-scroll"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {safeCourses.map((item, index) => (
                  <div className="course-item" key={item.id || index}>
                    <div className="course-name">
                      {item.title || "Khóa học không tên"}
                    </div>
                    <div className="course-price">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedCount > 0 && (
              <>
                <div className="course-count">{selectedCount} khóa học</div>
                <div className="price">
                  <div className="price-text">Tổng cộng:</div>
                  <div className="price-total">{formatPrice(totalPrice)}</div>
                </div>
              </>
            )}
          </div>

          {/* Cột phải: Phương thức thanh toán */}
          <div className="payment-method">
            <h3>💰 Phương Thức Thanh Toán</h3>

            <div className={`method ${!isValidToPay ? "disabled" : ""}`}>
              <img src={momo} alt="MoMo logo" className="method-icon" />
              <div className="method-name">Thanh toán qua Ví MoMo</div>
            </div>

            <button
              className="checkout-btn payment-btn"
              onClick={handlePayment}
              disabled={isLoading || !isValidToPay}
              style={{
                opacity: isLoading || !isValidToPay ? 0.6 : 1,
                cursor: isLoading || !isValidToPay ? "not-allowed" : "pointer",
                filter: !isValidToPay ? "grayscale(100%)" : "none",
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
