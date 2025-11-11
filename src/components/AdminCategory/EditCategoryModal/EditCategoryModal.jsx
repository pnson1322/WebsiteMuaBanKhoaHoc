import React from "react";
import { Edit2 } from "lucide-react";
import "./EditCategoryModal.css";

const EditCategoryModal = ({
  category,
  editingName,
  onNameChange,
  onClose,
  onSubmit,
}) => {
  if (!category) return null;

  return (
    <div
      className="cat-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-category-title"
      onClick={onClose}
    >
      <div
        className="cat-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cat-modal__header">
          <div className="cat-modal__icon cat-modal__icon--edit">
            <Edit2 size={20} />
          </div>
          <div>
            <h3 id="edit-category-title">Sửa Danh Mục</h3>
            <p>Cập nhật tên danh mục</p>
          </div>
        </header>

        <form className="cat-modal__form" onSubmit={onSubmit}>
          <label htmlFor="edit-category-name">
            Tên danh mục <span>*</span>
          </label>
          <input
            id="edit-category-name"
            type="text"
            value={editingName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nhập tên danh mục..."
            autoFocus
          />

          <div className="cat-modal__actions">
            <button
              type="button"
              className="cat-btn cat-btn--ghost"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="cat-btn cat-btn--primary">
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;

