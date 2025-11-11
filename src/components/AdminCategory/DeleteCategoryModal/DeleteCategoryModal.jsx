import React from "react";
import { AlertTriangle } from "lucide-react";
import "./DeleteCategoryModal.css";

const DeleteCategoryModal = ({ category, onClose, onConfirm }) => {
  if (!category) return null;

  return (
    <div
      className="cat-modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-category-title"
      onClick={onClose}
    >
      <div
        className="cat-modal cat-modal--danger"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cat-modal__header">
          <div className="cat-modal__icon cat-modal__icon--danger">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 id="delete-category-title">Xác Nhận Xóa</h3>
            <p>Hành động này không thể hoàn tác</p>
          </div>
        </header>

        <div className="cat-modal__actions cat-modal__actions--inline">
          <button
            type="button"
            className="cat-btn cat-btn--ghost"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="cat-btn cat-btn--danger"
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;

