import React from "react";
import { User, Mail, Phone } from "lucide-react";
import "./UserViewModal.css";

const UserViewModal = ({ user, editingUser, onClose }) => {
  if (!user || !editingUser) return null;

  return (
    <div
      className="users-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="users-modal users-modal--edit"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="users-modal__header">
          <div>
            <div className="users-modal__icon users-modal__icon--edit">
              <User size={20} />
            </div>
            <h3>Thông Tin Người Dùng</h3>
          </div>
          <button
            className="users-modal__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <form className="users-modal__form">
          <div className="users-form-group">
            <label htmlFor="edit-name">
              <User size={16} />
              Họ và Tên
            </label>
            <input
              id="edit-name"
              type="text"
              value={editingUser.fullName}
              readOnly // ⛔ KHÔNG sửa
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="users-form-group">
            <label htmlFor="edit-email">
              <Mail size={16} />
              Email
            </label>
            <input
              id="edit-email"
              type="email"
              value={editingUser.email}
              readOnly // ⛔ KHÔNG sửa
              placeholder="Nhập email..."
            />
          </div>

          <div className="users-form-group">
            <label htmlFor="edit-phone">
              <Phone size={16} />
              Số Điện Thoại
            </label>
            <input
              id="edit-phone"
              type="text"
              value={editingUser.phoneNumber || ""}
              readOnly // ⛔ KHÔNG sửa
              placeholder="Nhập số điện thoại..."
            />
          </div>

          <div className="users-form-group">
            <label htmlFor="edit-role">
              <User size={16} />
              Vai Trò
            </label>
            <select
              id="edit-role"
              value={editingUser.role}
              disabled // ⛔ Không cho chỉnh
              className="users-form-select"
            >
              <option value="BUYER">Người Mua</option>
              <option value="SELLER">Người Bán</option>
              <option value="ADMIN">Quản Trị Viên</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserViewModal;
