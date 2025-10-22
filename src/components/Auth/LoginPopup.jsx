import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // ✅ dùng AuthContext
import {
  Overlay,
  PopupContainer,
  Header,
  Title,
  CloseButton,
  HighlightBox,
  HighlightTitle,
  HighlightDesc,
  InputGroup,
  InputIcon,
  InputField,
  ToggleEye,
  SubmitButton,
  FooterText,
  LinkText,
  Divider,
  FullPageButton,
  ScrollArea,
} from "./LoginPopup.styled";
import { X, Mail, Lock, Eye, EyeOff, User, Users } from "lucide-react";

const LoginPopup = ({ onClose, setShowForgot }) => {
  const { login } = useAuth(); // ✅ Lấy hàm login từ context
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Học viên");

  // ✅ Điều hướng đến trang đầy đủ
  const handleFullPage = () => {
    onClose();
    if (isRegister) navigate("/register");
    else navigate("/login");
  };

  // ✅ Hàm đăng nhập thực tế
  const handleLogin = () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    const userData = {
      name: fullName || "Người dùng",
      email,
      role: "learner",
    };

    login(userData); // ✅ Cập nhật AuthContext
    alert("Đăng nhập thành công!");
    onClose(); // ✅ Đóng popup
  };

  // ✅ Hàm đăng ký thực tế
  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    const newUser = {
      name: fullName,
      email,
      role: role === "Giảng viên" ? "seller" : "learner",
    };

    login(newUser); // ✅ Cho đăng nhập luôn sau khi đăng ký
    alert("Đăng ký thành công!");
    onClose();
  };

  return (
    <Overlay>
      <PopupContainer $isRegister={isRegister}>
        {/* Header */}
        <Header>
          <Title>{isRegister ? "Đăng ký" : "Đăng nhập"}</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        {/* Highlight Box */}
        <HighlightBox>
          <HighlightTitle>🚀 Mở khóa tính năng đặc biệt!</HighlightTitle>
          <HighlightDesc>
            {isRegister
              ? "Tạo tài khoản để khám phá AI gợi ý khóa học phù hợp nhất với bạn"
              : "Đăng nhập để sử dụng AI gợi ý khóa học phù hợp với bạn"}
          </HighlightDesc>
        </HighlightBox>

        {/* Scroll nội dung */}
        <ScrollArea>
          {!isRegister ? (
            <>
              {/* ==== LOGIN ==== */}
              <InputGroup>
                <label>Email</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <Mail size={18} />
                  </InputIcon>
                  <InputField
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </InputGroup>

              <InputGroup>
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <Lock size={18} />
                  </InputIcon>
                  <InputField
                    type={showPass ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <ToggleEye onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </ToggleEye>
                </div>

                <button
                  type="button"
                  className="forgot"
                  onClick={() => {
                    onClose();
                    setShowForgot(true);
                  }}
                >
                  Quên mật khẩu?
                </button>
              </InputGroup>

              <SubmitButton onClick={handleLogin}>Đăng nhập</SubmitButton>

              <Divider />
              <FooterText>
                Chưa có tài khoản?
                <LinkText as="button" onClick={() => setIsRegister(true)}>
                  Đăng ký ngay
                </LinkText>
              </FooterText>
            </>
          ) : (
            <>
              {/* ==== REGISTER ==== */}
              <InputGroup>
                <label>Họ và tên</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <User size={18} />
                  </InputIcon>
                  <InputField
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </InputGroup>

              <InputGroup>
                <label>Email</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <Mail size={18} />
                  </InputIcon>
                  <InputField
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </InputGroup>

              <InputGroup>
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <Lock size={18} />
                  </InputIcon>
                  <InputField
                    type={showPass ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <ToggleEye onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </ToggleEye>
                </div>
              </InputGroup>

              <InputGroup>
                <label>Xác nhận mật khẩu</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <Lock size={18} />
                  </InputIcon>
                  <InputField
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <ToggleEye onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </ToggleEye>
                </div>
              </InputGroup>

              <InputGroup>
                <label>Vai trò</label>
                <div className="input-wrapper">
                  <InputIcon>
                    <Users size={18} />
                  </InputIcon>
                  <InputField
                    as="select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option>Học viên</option>
                    <option>Giảng viên</option>
                  </InputField>
                </div>
              </InputGroup>

              <SubmitButton onClick={handleRegister}>Đăng ký</SubmitButton>

              <Divider />
              <FooterText>
                Đã có tài khoản?
                <LinkText as="button" onClick={() => setIsRegister(false)}>
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
    </Overlay>
  );
};

export default LoginPopup;
