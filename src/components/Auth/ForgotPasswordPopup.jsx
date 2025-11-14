import React, { useState } from "react";
import instance from "../../services/axiosInstance";
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalBody,
} from "./Auth.styled";
import { Edit3, CheckCircle } from "lucide-react";

const ForgotPasswordPopup = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset pass
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================
  // 1) Gửi email lấy OTP
  // ============================
  const handleSendOTP = async () => {
    if (!forgotEmail) {
      return alert("Vui lòng nhập email");
    }

    try {
      setLoading(true);

      await instance.post("/api/auth/forgot-password", {
        email: forgotEmail,
      });

      alert(`OTP đã được gửi tới email: ${forgotEmail}`);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 2) Kiểm tra OTP
  // ============================
  const handleVerifyOTP = async () => {
    if (!otpCode) return alert("Vui lòng nhập mã OTP");

    try {
      setLoading(true);

      await instance.post("/api/auth/check-otp", {
        email: forgotEmail,
        otp: otpCode,
      });

      alert("Xác thực OTP thành công!");
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "OTP không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 3) Reset mật khẩu
  // ============================
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return alert("Vui lòng nhập đầy đủ mật khẩu");

    if (newPassword !== confirmPassword)
      return alert("Mật khẩu xác nhận không khớp");

    try {
      setLoading(true);

      await instance.post("/api/auth/reset-password", {
        email: forgotEmail,
        otp: otpCode,
        newPassword,
      });

      alert("Đặt lại mật khẩu thành công!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
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
          {/* STEP 1 — EMAIL */}
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
                <button className="cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button className="send" onClick={handleSendOTP} disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi OTP"}
                </button>
              </div>
            </>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <>
              <label>Nhập mã OTP được gửi tới email</label>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />

              <div className="actions">
                <button className="cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button
                  className="send"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading ? "Đang kiểm tra..." : "Xác nhận"}
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — RESET PASSWORD */}
          {step === 3 && (
            <>
              <label>Nhập mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="actions">
                <button className="cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button
                  className="send"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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
