import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch } from "../contexts/AppContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Home, RotateCcw, Loader2 } from "lucide-react";
import "./PaymentResult.css";
import { momoAPI } from "../services/momoAPI";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const { syncUserData } = useAppDispatch();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'failed'
  const [message, setMessage] = useState("Đang xác thực giao dịch...");

  const isCalled = useRef(false);

  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");
  const transId = searchParams.get("transId");

  useEffect(() => {
    if (isCalled.current) return;
    isCalled.current = true;

    const verifyPayment = async () => {
      try {
        const params = Object.fromEntries([...searchParams]);

        console.log("Gửi params về BE xác thực:", params);

        await momoAPI.momoNotify(params);

        if (params.resultCode == "0") {
          setStatus("success");
          setMessage("Cảm ơn bạn đã mua khóa học. Chúc bạn học tập tốt!");

          if (syncUserData) {
            syncUserData();
          }
        } else {
          setStatus("failed");
          setMessage("Giao dịch thất bại hoặc bị hủy bởi người dùng.");
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setStatus("failed");
        const errorMsg =
          error.response?.data?.message || "Xác thực giao dịch thất bại.";
        setMessage(errorMsg);
      }
    };

    verifyPayment();
  }, [searchParams, syncUserData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (status === "loading") {
    return (
      <div className="payment-result-container">
        <div className="payment-card">
          <div className="payment-result-icon-wrapper">
            <Loader2
              className="payment-result-status-icon animate-spin"
              size={80}
              color="#a50064"
            />
          </div>
          <h1 className="payment-result-status-title">Đang xử lý...</h1>
          <p className="payment-result-status-message">
            Vui lòng không tắt trình duyệt.
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="payment-result-container">
      <div
        className={`payment-card ${
          isSuccess ? "payment-result-success" : "payment-result-error"
        }`}
      >
        <div className="payment-result-icon-wrapper">
          {isSuccess ? (
            <CheckCircle className="payment-result-status-icon" size={80} />
          ) : (
            <XCircle className="payment-result-status-icon" size={80} />
          )}
        </div>

        <h1 className="payment-result-status-title">
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        <p className="payment-result-status-message">{message}</p>

        <div className="payment-result-transaction-details">
          <div className="payment-result-detail-row">
            <span>Mã đơn hàng:</span>
            <strong>{orderId || "---"}</strong>
          </div>
          <div className="payment-result-detail-row">
            <span>Mã giao dịch MoMo:</span>
            <strong>{transId || "---"}</strong>
          </div>
          <div className="payment-result-detail-row payment-result-total">
            <span>Tổng tiền:</span>
            <strong
              className={
                isSuccess
                  ? "payment-result-text-success"
                  : "payment-result-text-error"
              }
            >
              {amount ? formatPrice(amount) : "0 đ"}
            </strong>
          </div>
        </div>

        <div className="payment-result-actions">
          {isSuccess ? (
            <button
              className="payment-result-btn-primary"
              onClick={() => navigate("/purchased", { replace: true })}
            >
              <Home size={20} />
              Vào học ngay
            </button>
          ) : (
            <button
              className="payment-result-btn-primary"
              onClick={() => navigate("/cart")}
            >
              <RotateCcw size={20} />
              Quay lại giỏ hàng
            </button>
          )}

          <button
            className="payment-result-btn-secondary"
            onClick={() => navigate("/", { replace: true })}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
