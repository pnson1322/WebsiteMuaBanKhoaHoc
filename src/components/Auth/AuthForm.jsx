import React, { useState } from "react";
import {
  AuthFormWrapper,
  FormGroup,
  Label,
  InputContainer,
  Input,
  TogglePassword,
  SubmitButton,
  LoadingSpinner,
  RegisterSuccess,
  AuthSwitch,
  SwitchButton,
  ErrorText,
  ForgotPasswordLink,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalBody,
} from "./Auth.styled";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  CheckCircle,
  Edit3,
} from "lucide-react";
import styled from "styled-components";

const AuthForm = ({
  mode,
  formData,
  onChange,
  onSubmit,
  errors,
  success,
  loading,
  onSwitchMode,
}) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showVerify, setShowVerify] = useState(false); // ✅ popup thứ 2
  const [otpCode, setOtpCode] = useState(""); // ✅ input OTP
  const [showReset, setShowReset] = useState(false); // ✅ popup đặt lại mật khẩu
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      <AuthFormWrapper onSubmit={(e) => onSubmit(e, formData)}>
        {/* Họ và tên (chỉ có khi register) */}
        {mode === "register" && (
          <FormGroup>
            <Label>Họ và tên</Label>
            <InputContainer>
              <User className="input-icon" />
              <Input
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Nhập họ và tên"
                className={errors.name ? "error" : ""}
              />
            </InputContainer>
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>
        )}

        {/* Email */}
        <FormGroup>
          <Label>Email</Label>
          <InputContainer>
            <Mail className="input-icon" />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Nhập email"
              className={errors.email ? "error" : ""}
            />
          </InputContainer>
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </FormGroup>

        {/* Mật khẩu */}
        <FormGroup>
          <Label>Mật khẩu</Label>
          <InputContainer>
            <Lock className="input-icon" />
            <Input
              name="password"
              type={showPass ? "text" : "password"}
              value={formData.password}
              onChange={onChange}
              placeholder="Nhập mật khẩu"
              className={errors.password ? "error" : ""}
            />
            <TogglePassword
              type="button"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff /> : <Eye />}
            </TogglePassword>
          </InputContainer>
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
          {mode === "login" && (
            <ForgotPasswordLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowForgot(true);
              }}
            >
              Quên mật khẩu?
            </ForgotPasswordLink>
          )}
        </FormGroup>

        {/* Xác nhận mật khẩu */}
        {mode === "register" && (
          <FormGroup>
            <Label>Xác nhận mật khẩu</Label>
            <InputContainer>
              <Lock className="input-icon" />
              <Input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={onChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? "error" : ""}
              />
              <TogglePassword
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </TogglePassword>
            </InputContainer>
            {errors.confirmPassword && (
              <ErrorText>{errors.confirmPassword}</ErrorText>
            )}
          </FormGroup>
        )}

        {/* Hiển thị khi đăng ký thành công */}
        {success && mode === "register" && (
          <RegisterSuccess>
            <CheckCircle />
            <div>
              <strong>Đăng ký thành công!</strong>
              <p>Đang chuyển sang đăng nhập...</p>
            </div>
          </RegisterSuccess>
        )}

        {/* Nút Đăng nhập / Đăng ký */}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <LoadingSpinner />
          ) : mode === "login" ? (
            "Đăng nhập"
          ) : (
            "Tạo tài khoản"
          )}
        </SubmitButton>

        {/* Nút chuyển chế độ */}
        <AuthSwitch>
          <p>
            {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            <SwitchButton type="button" onClick={onSwitchMode}>
              {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
            </SwitchButton>
          </p>
        </AuthSwitch>
      </AuthFormWrapper>

      {/* Popup Quên mật khẩu */}
      {showForgot && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <div className="icon-wrap">
                <Edit3 size={20} color="#fff" />
              </div>
              <h2>Quên mật khẩu</h2>
            </ModalHeader>

            <ModalBody>
              <label>Nhập địa chỉ email của bạn</label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <div className="actions">
                <button className="cancel" onClick={() => setShowForgot(false)}>
                  Hủy
                </button>
                <button
                  className="send"
                  onClick={() => {
                    // Khi bấm Gửi OTP → mở popup xác thực
                    setShowForgot(false);
                    setShowVerify(true);
                  }}
                >
                  Gửi OTP
                </button>
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
      {/* Popup Xác thực email */}
      {showVerify && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <div className="icon-wrap">
                <Edit3 size={20} color="#fff" />
              </div>
              <h2>Xác thực email</h2>
            </ModalHeader>

            <ModalBody>
              <label>Nhập mã OTP vừa được gửi tới email của bạn</label>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <div className="actions">
                <button className="cancel" onClick={() => setShowVerify(false)}>
                  Hủy
                </button>
                <button
                  className="send"
                  onClick={() => {
                    // ✅ Khi xác thực xong → mở popup đặt lại mật khẩu
                    setShowVerify(false);
                    setShowReset(true);
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
      {showReset && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <div className="icon-wrap">
                <Edit3 size={20} color="#fff" />
              </div>
              <h2>Đặt lại mật khẩu</h2>
            </ModalHeader>

            <ModalBody>
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
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="actions">
                <button className="cancel" onClick={() => setShowReset(false)}>
                  Hủy
                </button>
                <button
                  className="send"
                  onClick={() => {
                    alert("Mật khẩu đã được đặt lại thành công!");
                    setShowReset(false);
                    setTimeout(() => {
                      if (mode !== "login") {
                        onSwitchMode(); // chuyển sang chế độ đăng nhập
                      }
                    }, 2000);
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default AuthForm;
