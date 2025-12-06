import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthForm from "../../hooks/useAuthForm";
import ForgotPasswordPopup from "./ForgotPasswordPopup";
import VerifyEmailModal from "../AdminUser/VerifyEmailModal/VerifyEmailModal";
import PasswordStrengthBar from "../common/PasswordStrengthBar";
import {
  Overlay,
  PopupContainer,
  Header,
  Title,
  CloseButton,
  HighlightBox,
  HighlightTitle,
  HighlightDesc,
  FormGroup,
  Label,
  InputContainer,
  Input,
  TogglePassword,
  SubmitButton,
  FooterText,
  LinkText,
  Divider,
  FullPageButton,
  ScrollArea,
  ForgotPasswordLink,
  ErrorText,
} from "./LoginPopup.styled";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Users,
  ChevronDown,
} from "lucide-react";

const LoginPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLoginSuccess = () => {
    // 1. Đóng popup trước
    onClose();

    // 2. Chuyển hướng về trang chủ (dấu "/" đại diện cho localhost:5173)
    navigate("/");
  };


  // ✅ Sử dụng hook useAuthForm
  const {
    mode,
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    switchMode,
    setMode: setIsRegister,
    showVerifyEmailModal,
    verifyEmail,
    handleResendOTP,
    handleCloseVerifyModal,
  } = useAuthForm("login", handleLoginSuccess);
  const isRegister = mode === "register";
  // ✅ Mở trang đầy đủ
  const handleFullPage = () => {
    onClose();
    navigate(isRegister ? "/register" : "/login");
  };

  return (
    <Overlay>
      <PopupContainer $isRegister={isRegister}>
        {/* ==== HEADER ==== */}
        <Header>
          <Title>{isRegister ? "Đăng ký" : "Đăng nhập"}</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        {/* ==== HIGHLIGHT ==== */}
        <HighlightBox>
          <HighlightTitle>🚀 Mở khóa tính năng đặc biệt!</HighlightTitle>
          <HighlightDesc>
            {isRegister
              ? "Từng bước chinh phục kỹ năng bạn cần, từ cơ bản đến nâng cao"
              : "Từng bước chinh phục kỹ năng bạn cần, từ cơ bản đến nâng cao"}
          </HighlightDesc>
        </HighlightBox>

        {/* ==== FORM ==== */}
        <ScrollArea>
          {!isRegister ? (
            <>
              {/* ==== LOGIN ==== */}
              <FormGroup>
                <Label>Email</Label>
                <InputContainer>
                  <Mail className="input-icon" size={18} />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                  />
                </InputContainer>
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>Mật khẩu</Label>
                <InputContainer>
                  <Lock className="input-icon" size={18} />
                  <Input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                  />
                  <TogglePassword onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </TogglePassword>
                </InputContainer>
                {errors.password && <ErrorText>{errors.password}</ErrorText>}
                <ForgotPasswordLink onClick={() => setShowForgot(true)}>
                  Quên mật khẩu?
                </ForgotPasswordLink>
              </FormGroup>

              <SubmitButton onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </SubmitButton>

              <Divider />
              <FooterText>
                Chưa có tài khoản?
                <LinkText as="button" onClick={() => switchMode("register")}>
                  Đăng ký ngay
                </LinkText>
              </FooterText>
            </>
          ) : (
            <>
              {/* ==== REGISTER ==== */}
              <FormGroup>
                <Label>Họ và tên</Label>
                <InputContainer>
                  <User className="input-icon" size={18} />
                  <Input
                    name="name"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "error" : ""}
                  />
                </InputContainer>
                {errors.name && <ErrorText>{errors.name}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <InputContainer>
                  <Mail className="input-icon" size={18} />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                  />
                </InputContainer>
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>Mật khẩu</Label>
                <InputContainer>
                  <Lock className="input-icon" size={18} />
                  <Input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                  />
                  <TogglePassword onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </TogglePassword>
                </InputContainer>
                {errors.password && <ErrorText>{errors.password}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>Xác nhận mật khẩu</Label>
                <InputContainer>
                  <Lock className="input-icon" size={18} />
                  <Input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "error" : ""}
                  />
                  <TogglePassword onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </TogglePassword>
                </InputContainer>
                {errors.confirmPassword && (
                  <ErrorText>{errors.confirmPassword}</ErrorText>
                )}
              </FormGroup>

              {/* Password Strength Bar */}
              <PasswordStrengthBar password={formData.password} />

              <FormGroup>
                <Label>Vai trò</Label>
                <InputContainer>
                  <Users className="input-icon" size={18} />
                  <Input
                    as="select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option>Học viên</option>
                    <option>Người bán</option>
                  </Input>
                  <ChevronDown className="select-arrow" size={18} />
                </InputContainer>
              </FormGroup>

              <SubmitButton onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </SubmitButton>

              <Divider />
              <FooterText>
                Đã có tài khoản?
                <LinkText as="button" onClick={() => switchMode("login")}>
                  Đăng nhập
                </LinkText>
              </FooterText>
            </>
          )}
        </ScrollArea>

        <FullPageButton onClick={handleFullPage}>
          Mở trang đầy đủ
        </FullPageButton>
      </PopupContainer>

      {/* ==== FORGOT PASSWORD POPUP ==== */}
      {showForgot && (
        <ForgotPasswordPopup onClose={() => setShowForgot(false)} />
      )}

      {/* ==== VERIFY EMAIL MODAL ==== */}
      <VerifyEmailModal
        isOpen={showVerifyEmailModal}
        email={verifyEmail}
        onClose={handleCloseVerifyModal}
        onResendOTP={handleResendOTP}
      />
    </Overlay>
  );
};

export default LoginPopup;
