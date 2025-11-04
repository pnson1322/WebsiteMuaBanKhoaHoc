import React, { useState } from "react";
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalBody,
} from "./Auth.styled";
import { Edit3, CheckCircle } from "lucide-react";

const ForgotPasswordPopup = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: xác thực OTP, 3: đặt lại mật khẩu
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOTP = () => {
    if (!forgotEmail) {
      alert("Vui lòng nhập email");
      return;
    }
    // Giả lập gửi OTP
    alert(`Mã OTP đã được gửi tới ${forgotEmail}`);
    setStep(2);
  };

  const handleVerifyOTP = () => {
    if (!otpCode) {
      alert("Vui lòng nhập mã OTP");
      return;
    }
    // Giả lập xác thực OTP
    alert("Xác thực thành công!");
    setStep(3);
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }
    // Giả lập đặt lại mật khẩu
    alert("Đặt lại mật khẩu thành công!");
    onClose();
  };

  const handleCancel = () => {
    setStep(1);
    setForgotEmail("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <div className="icon-wrap">
            {step === 3 ? (
              <CheckCircle size={20} color="#fff" />
            ) : (
              <Edit3 size={20} color="#fff" />
            )}
          </div>
          <h2>
            {step === 1
              ? "Quên mật khẩu"
              : step === 2
              ? "Xác thực email"
              : "Đặt lại mật khẩu"}
          </h2>
        </ModalHeader>

        <ModalBody>
          {step === 1 && (
            <>
              <label>Nhập địa chỉ email của bạn</label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <div className="actions">
                <button type="button" className="cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button type="button" className="send" onClick={handleSendOTP}>
                  Gửi OTP
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <label>Nhập mã OTP vừa được gửi tới email của bạn</label>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <div className="actions">
                <button type="button" className="cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button type="button" className="send" onClick={handleVerifyOTP}>
                  Xác nhận
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label>Nhập mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label>Xác thực mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="actions">
                <button type="button" className="cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button type="button" className="send" onClick={handleResetPassword}>
                  Đặt lại mật khẩu
                </button>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ForgotPasswordPopup;

