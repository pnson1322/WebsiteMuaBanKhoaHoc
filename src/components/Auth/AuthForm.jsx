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
} from "./Auth.styled";
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from "lucide-react";

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

  return (
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
          <TogglePassword type="button" onClick={() => setShowPass(!showPass)}>
            {showPass ? <EyeOff /> : <Eye />}
          </TogglePassword>
        </InputContainer>
        {errors.password && <ErrorText>{errors.password}</ErrorText>}
      </FormGroup>

      {/* Xác nhận mật khẩu (chỉ khi register) */}
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
  );
};

export default AuthForm;
