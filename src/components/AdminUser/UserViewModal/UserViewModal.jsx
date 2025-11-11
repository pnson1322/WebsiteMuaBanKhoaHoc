import React from "react";
import { User, Mail, Save } from "lucide-react";
import "./UserViewModal.css";

const UserViewModal = ({ user, editingUser, onClose, onUpdate, onFormChange }) => {
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
        <form className="users-modal__form" onSubmit={onUpdate}>
          <div className="users-form-group">
            <label htmlFor="edit-name">
              <User size={16} />
              Họ và Tên
            </label>
            <input
              id="edit-name"
              type="text"
              value={editingUser.name}
              onChange={(e) => onFormChange("name", e.target.value)}
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
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="Nhập email..."
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
              onChange={(e) => onFormChange("role", e.target.value)}
              className="users-form-select"
            >
              <option value="BUYER">Người Mua</option>
              <option value="SELLER">Người Bán</option>
              <option value="ADMIN">Quản Trị Viên</option>
            </select>
          </div>

          <button
            type="submit"
            className="users-btn users-btn--primary users-btn--full"
          >
            <Save size={18} />
            Cập Nhật Thông Tin
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserViewModal;

