import React, { useState } from "react";
import { UserPlus, User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import "./AddAdminModal.css";

const AddAdminModal = ({
  isOpen,
  formData,
  errors = {},
  onClose,
  onSubmit,
  onFormChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="users-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="users-modal users-modal--add"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="users-modal__header">
          <div>
            <div className="users-modal__icon users-modal__icon--add">
              <UserPlus size={20} />
            </div>
            <h3>Thêm Admin</h3>
          </div>
          <button
            className="users-modal__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <form className="users-modal__form" onSubmit={onSubmit}>
          {/* Họ và tên */}
          <div className="users-form-group">
            <label htmlFor="add-fullName">
              <User size={16} />
              Họ và Tên
            </label>
            <input
              id="add-fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => onFormChange("fullName", e.target.value)}
              placeholder="Nhập họ và tên..."
              required
            />
          </div>

          {/* Email */}
          <div className="users-form-group">
            <label htmlFor="add-email">
              <Mail size={16} />
              Email
            </label>
            <input
              id="add-email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="Nhập email..."
              className={errors.email ? "error" : ""}
              required
            />
            {errors.email && (
              <span className="users-form-error">{errors.email}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="users-form-group">
            <label htmlFor="add-phone">
              <Phone size={16} />
              Số Điện Thoại
            </label>
            <input
              id="add-phone"
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => onFormChange("phoneNumber", e.target.value)}
              placeholder="Nhập số điện thoại..."
              className={errors.phoneNumber ? "error" : ""}
              required
            />
            {errors.phoneNumber && (
              <span className="users-form-error">{errors.phoneNumber}</span>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="users-form-group">
            <label htmlFor="add-password">
              <Lock size={16} />
              Mật khẩu
            </label>
            <div className="users-password-input">
              <input
                id="add-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => onFormChange("password", e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
              />
              <button
                type="button"
                className="users-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="users-btn users-btn--primary users-btn--full"
          >
            <UserPlus size={18} />
            Thêm Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
