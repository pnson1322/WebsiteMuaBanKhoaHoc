import React, { useState } from "react";
import ForgotPasswordPopup from "./ForgotPasswordPopup";
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
} from "./Auth.styled";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Users,
  CheckCircle,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

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

  return (
    <>
      <AuthFormWrapper onSubmit={(e) => onSubmit(e, formData)}>
        {/* ==== HỌ VÀ TÊN ==== */}
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

        {/* ==== EMAIL ==== */}
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

        {/* ==== MẬT KHẨU ==== */}
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

        {/* ==== XÁC NHẬN MẬT KHẨU ==== */}
        {mode === "register" && (
          <>
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

            {/* ==== VAI TRÒ ==== */}
            <FormGroup>
              <Label>Vai trò</Label>
              <InputContainer>
                <Users className="input-icon" />
                <Input
                  as="select"
                  name="role"
                  value={formData.role}
                  onChange={onChange}
                >
                  <option>Học viên</option>
                  <option>Người bán</option>
                  <option>Admin</option>
                </Input>
                <ChevronDown className="select-arrow" size={18} />
              </InputContainer>
            </FormGroup>
          </>
        )}

        {/* ==== THÔNG BÁO ĐĂNG KÝ THÀNH CÔNG ==== */}
        {success && mode === "register" && (
          <RegisterSuccess>
            <CheckCircle />
            <div>
              <strong>Đăng ký thành công!</strong>
              <p>Đang chuyển sang đăng nhập...</p>
            </div>
          </RegisterSuccess>
        )}

        {/* ==== NÚT SUBMIT ==== */}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <LoadingSpinner />
          ) : mode === "login" ? (
            <>
              Đăng nhập
              <ArrowRight size={20} className="arrow-icon" />
            </>
          ) : (
            <>
              Tạo tài khoản
              <ArrowRight size={20} className="arrow-icon" />
            </>
          )}
        </SubmitButton>

        {/* ==== NÚT CHUYỂN CHẾ ĐỘ ==== */}
        <AuthSwitch>
          <p>
            {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            <SwitchButton type="button" onClick={onSwitchMode}>
              {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
            </SwitchButton>
          </p>
        </AuthSwitch>
      </AuthFormWrapper>

      {/* ==== POPUP QUÊN MẬT KHẨU ==== */}
      {showForgot && (
        <ForgotPasswordPopup onClose={() => setShowForgot(false)} />
      )}
    </>
  );
};

export default AuthForm;
