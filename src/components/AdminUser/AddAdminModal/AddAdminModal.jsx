import React from "react";
import { UserPlus, User, Mail, Lock, Phone } from "lucide-react";
import "./AddAdminModal.css";

const AddAdminModal = ({
  isOpen,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}) => {
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
              required
            />
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
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="users-form-group">
            <label htmlFor="add-password">
              <Lock size={16} />
              Mật khẩu
            </label>
            <input
              id="add-password"
              type="password"
              value={formData.password}
              onChange={(e) => onFormChange("password", e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
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
