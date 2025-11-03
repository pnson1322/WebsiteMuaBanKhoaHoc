import {
  CheckCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PhoneCall,
  Save,
  Shield,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "./UserInfo.css";
import { useState } from "react";

const UserInfo = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    let percent = (score / 4) * 100;

    if (score === 0) return { label: "Yếu", color: "#ddd", percent: 0 };
    if (score === 1) return { label: "Yếu", color: "#667eea", percent };
    if (score === 2)
      return {
        label: "Trung bình",
        color: "linear-gradient(90deg, #667eea 0%, #a06ee1 100%)",
        percent,
      };
    if (score >= 3)
      return {
        label: "Mạnh",
        color: "linear-gradient(90deg, #667eea 0%, #a06ee1 50%, #764ba2 100%)",
        percent,
      };
  };

  const strength = calculateStrength(newPassword);

  function handleSaveInfoClick(e) {
    e.preventDefault?.();
    if (!user) {
      showError("Bạn chưa đăng nhập");
      return;
    }
    const trimmedName = (name || "").trim();
    const trimmedPhone = (phone || "").trim();
    if (!trimmedName) {
      showError("Vui lòng nhập họ và tên");
      return;
    }
    updateUser({ name: trimmedName, phone: trimmedPhone });
    showSuccess("Cập nhật thông tin thành công");
  }

  function handleSavePasswordClick(e) {
    e.preventDefault?.();
    if (!user) {
      showError("Bạn chưa đăng nhập");
      return;
    }
    if (!password || !newPassword || !confirmPassword) {
      showError("Vui lòng điền đầy đủ thông tin mật khẩu");
      return;
    }
    if (password === newPassword) {
      showError("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Mật khẩu mới không khớp");
      return;
    }
    if (newPassword.length < 6) {
      showError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    updateUser({ password: newPassword });
    showSuccess("Yêu cầu đổi mật khẩu đã được ghi nhận");
  }

  return (
    <div className="user-info">
      <div>
        <h1 className="header-text">Quản Lý Tài Khoản</h1>
        <p className="description-text">
          Cập nhật thông tin cá nhân và bảo mật tài khoản
        </p>
      </div>

      <div className="info">
        <div className="card">
          <div className="card-header">
            <div className="user-info-icon-wrapper">
              <UserRound className="user-info-icon" />
            </div>

            <div className="user-info-text">
              <h2>Thông Tin Cá Nhân</h2>
              <p>Quản lý thông tin tài khoản của bạn</p>
            </div>
          </div>

          <form>
            <label className="user-info-form-label">
              <UserRound className="user-info-form-icon" />
              <div>Họ và Tên</div>
            </label>

            <input
              type="text"
              name="name"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="user-info-form-input"
            />

            <label className="user-info-form-label">
              <Mail className="user-info-form-icon" />
              <div>Email</div>
            </label>

            <input
              type="text"
              name="email"
              placeholder="Nhập email"
              value={user?.email}
              className="user-info-form-input"
              disabled
            />

            <label className="user-info-form-label">
              <PhoneCall className="user-info-form-icon" />
              <div>Số điện thoại</div>
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="user-info-form-input"
            />

            <label className="user-info-form-label">
              <UserRoundPen className="user-info-form-icon" />
              <div>Vai Trò</div>
            </label>

            <input
              type="text"
              name="role"
              placeholder="Chọn vai trò"
              value={user?.role}
              className="user-info-form-input"
              disabled
            />
          </form>

          <button
            className="save-btn user-info-btn"
            onClick={handleSaveInfoClick}
          >
            <Save className="user-info-form-icon" />
            Cập nhật thông tin
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="password-icon-wrapper">
              <UserRound className="user-info-icon" />
            </div>

            <div className="user-info-text">
              <h2>Đổi mật khẩu</h2>
              <p>Cập nhật mật khẩu để bảo vệ tài khoản</p>
            </div>
          </div>

          <form>
            <label className="user-info-form-label">
              <UserRound className="user-info-form-icon" />
              <div>Mật Khẩu Hiện Tại</div>
            </label>

            <div className="password-input">
              <input
                type={showOldPassword ? "text" : "password"}
                name="old-password"
                placeholder="Nhập mật khẩu hiện tại"
                className="user-info-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div>Bạn quên mật khẩu?</div>

            <label className="user-info-form-label">
              <Lock className="user-info-form-icon" />
              <div>Mật Khẩu Mới</div>
            </label>

            <div className="password-input">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new-password"
                placeholder="Nhập mật khẩu mới"
                className="user-info-form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="strength-bar-container">
              <div className="strength-bar-wrapper">
                <div
                  className="strength-bar-fill"
                  style={{
                    width: `${strength.percent}%`,
                    background: strength.color,
                  }}
                ></div>
              </div>
              <div className="strength-text">{strength.label}</div>
            </div>

            <label className="user-info-form-label">
              <CheckCheck className="user-info-form-icon" />
              <div>Xác Nhận Mật Khẩu Mới</div>
            </label>

            <div className="password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm-new-password"
                placeholder="Nhập lại mật khẩu mới"
                className="user-info-form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </form>

          <button
            className="save-btn password-btn"
            onClick={handleSavePasswordClick}
          >
            <Shield className="user-info-form-icon" />
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
