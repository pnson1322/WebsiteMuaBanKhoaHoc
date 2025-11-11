import React from "react";
import { AlertTriangle } from "lucide-react";
import "./DeleteUserModal.css";

const DeleteUserModal = ({ user, onClose, onConfirm }) => {
  if (!user) return null;

  return (
    <div
      className="users-modal-overlay"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="users-modal users-modal--danger"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="users-modal__header">
          <div>
            <div className="users-modal__icon users-modal__icon--danger">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3>Xác Nhận Xóa</h3>
              <p>Hành động này không thể hoàn tác</p>
            </div>
          </div>
        </header>
        <div className="users-modal__body">
          <p>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <strong>{user.name}</strong>?
          </p>
        </div>
        <footer className="users-modal__footer">
          <button
            className="users-btn users-btn--ghost"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="users-btn users-btn--danger"
            onClick={onConfirm}
          >
            Xóa
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteUserModal;

