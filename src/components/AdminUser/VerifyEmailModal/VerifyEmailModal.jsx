import React, { useState, useEffect } from "react";
import { Mail, RefreshCw } from "lucide-react";
import "./VerifyEmailModal.css";

const VerifyEmailModal = ({ isOpen, email, onClose, onResendOTP }) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(60);
      setCanResend(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, isOpen]);

  const handleResendOTP = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);

    if (onResendOTP) {
      await onResendOTP();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="verify-email-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="verify-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="verify-email-modal__icon">
          <Mail size={48} />
        </div>

        <h3 className="verify-email-modal__title">Xác thực Email</h3>

        <p className="verify-email-modal__message">
          Vui lòng kiểm tra và xác thực email
        </p>

        {email && <p className="verify-email-modal__email">{email}</p>}

        <p className="verify-email-modal__instruction">
          Chúng tôi đã gửi xác thực đến email của bạn. Vui lòng kiểm tra hộp thư
          và làm theo hướng dẫn để hoàn tất việc tạo tài khoản.
        </p>

        <button
          className={`verify-email-modal__resend-btn ${
            !canResend ? "verify-email-modal__resend-btn--disabled" : ""
          }`}
          onClick={handleResendOTP}
          disabled={!canResend}
        >
          <RefreshCw size={18} />
          {canResend ? "Gửi lại xác thực" : `Gửi lại xác thực (${countdown}s)`}
        </button>

        <button className="verify-email-modal__close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailModal;
