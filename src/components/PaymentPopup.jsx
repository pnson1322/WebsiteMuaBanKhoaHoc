import { CreditCard, X } from "lucide-react";
import "./PaymentPopup.css";
import momo from "../assets/momo.png";

const PaymentPopup = ({ onClose, course }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const selectedCount = course.length;
  const totalPrice = course.reduce((sum, course) => sum + course.price, 0);

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment" onClick={(e) => e.stopPropagation()}>
        <div className="title-section">
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
                  <div className="course-name">{item.name}</div>

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

            <button className="checkout-btn payment-btn">
              <CreditCard className="checkout-icon" />
              Thanh toán ngay
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
