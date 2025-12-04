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
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { userAPI } from "../services/userAPI";
import "./UserInfo.css";
import { useState, useEffect } from "react";
import ForgotPasswordPopup from "../components/Auth/ForgotPasswordPopup";
import PasswordStrengthBar from "../components/common/PasswordStrengthBar";

const UserInfo = () => {
  const { refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userData, setUserData] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ===== GET USER DETAIL =====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userAPI.getUserDetail();
        setUserData(data);

        setName(data.fullName || "");
        setPhone(data.phoneNumber || "");
        setRole(
          data.role === "Admin"
            ? "Quản lý"
            : data.role === "Buyer"
            ? "Học viên"
            : "Người bán"
        );

        setAvatarPreview(data.avatarUrl || data.image || null);
      } catch (err) {
        showError("Không lấy được thông tin người dùng");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [showError]);

  // =========== handle Avatar ============
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return showError("Chỉ chấp nhận file ảnh");
    if (file.size > 2 * 1024 * 1024)
      return showError("Kích thước ảnh tối đa là 2MB");

    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setDeleteImage(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);

    setAvatarPreview(null);
    setAvatarFile(null);
    setDeleteImage(true);
  };

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // =========== SAVE INFO ============
  async function handleSaveInfoClick(e) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return showError("Vui lòng nhập họ tên");

    setIsUploading(true);
    try {
      await userAPI.updateUser({
        fullName: trimmedName,
        phoneNumber: phone.trim(),
        avatarFile,
      });

      const updated = await refreshUser();

      setUserData(updated);
      setAvatarFile(null);
      setAvatarPreview(updated.avatarUrl || updated.image);

      showSuccess("Cập nhật thông tin thành công");
    } catch (err) {
      showError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsUploading(false);
    }
  }

  // =========== CHANGE PASSWORD ============
  async function handleSavePasswordClick(e) {
    e.preventDefault();

    if (!password || !newPassword || !confirmPassword)
      return showError("Vui lòng điền đầy đủ mật khẩu");

    if (password === newPassword)
      return showError("Mật khẩu mới không được trùng với mật khẩu hiện tại");

    if (newPassword !== confirmPassword)
      return showError("Mật khẩu xác nhận không khớp");

    if (newPassword.length < 6)
      return showError("Mật khẩu phải có ít nhất 6 ký tự");

    setIsChangingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword: password,
        newPassword: newPassword,
      });

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSuccess("Đổi mật khẩu thành công");
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại"
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (loadingUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Loader2 className="spinning" size={32} />
      </div>
    );
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
        {/* Thẻ thông tin cá nhân */}
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
            <div className="avatar-section user-info-form-container">
              <label className="avatar-uploader" htmlFor="avatar-upload-input">
                <img
                  src={
                    avatarPreview ||
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-user-round'%3E%3Ccircle cx='12' cy='8' r='5'/%3E%3Cpath d='M20 21a8 8 0 0 0-16 0'/%3E%3C/svg%3E"
                  }
                  alt="Avatar"
                  className="profile-avatar"
                />
                <div className="avatar-overlay">
                  <Camera size={20} />
                </div>
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
              </label>
              <button
                type="button"
                className="avatar-remove-btn"
                onClick={handleRemoveAvatar}
                disabled={isUploading || !avatarPreview}
              >
                <Trash2 size={16} /> Xóa ảnh
              </button>
            </div>

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
              value={userData?.email || ""}
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
              value={role}
              className="user-info-form-input"
              disabled
            />
          </form>

          <button
            className="save-btn user-info-btn"
            onClick={handleSaveInfoClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="user-info-form-icon spinning" />
            ) : (
              <Save className="user-info-form-icon" />
            )}
            {isUploading ? "Đang lưu..." : "Cập nhật thông tin"}
          </button>
        </div>

        {/* Thẻ đổi mật khẩu */}
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

            <button
              type="button"
              className="forgot-password"
              onClick={() => setShowForgotPassword(true)}
            >
              Bạn quên mật khẩu?
            </button>

            {showForgotPassword && (
              <ForgotPasswordPopup
                onClose={() => setShowForgotPassword(false)}
              />
            )}

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

            <PasswordStrengthBar password={newPassword} />

            <div className="security-tips">
              <h4>Mẹo bảo mật:</h4>
              <ul>
                <li>
                  Mật khẩu mạnh nên dài (tối thiểu 6 ký tự) và kết hợp chữ hoa,
                  chữ thường, số, và <strong>ký tự đặc biệt</strong> (như !@#$).
                </li>
                <li>
                  Không dùng chung mật khẩu này cho bất kỳ tài khoản nào khác.
                </li>
              </ul>
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
