import React from "react";
import { PlusCircle } from "lucide-react";
import "./CategoryForm.css";

const CategoryForm = ({ newCategory, onCategoryChange, onSubmit, totalCategories }) => {
  return (
    <section className="cat-card cat-card--form">
      <header className="cat-card__header">
        <div className="cat-card__icon">
          <PlusCircle size={22} />
        </div>
        <div>
          <h2>Thêm Danh Mục Mới</h2>
          <p>Tạo nhanh danh mục để quản lý khóa học hiệu quả hơn</p>
        </div>
      </header>

      <form className="cat-form" onSubmit={onSubmit}>
        <label htmlFor="category-name">
          Tên danh mục <span>*</span>
        </label>
        <input
          id="category-name"
          type="text"
          value={newCategory}
          placeholder="Nhập tên danh mục..."
          onChange={(event) => onCategoryChange(event.target.value)}
        />

        <button type="submit" className="cat-primary-btn">
          Thêm Danh Mục
        </button>
      </form>

      <footer className="cat-summary">
        <span>Tổng số danh mục:</span>
        <strong>{totalCategories}</strong>
      </footer>
    </section>
  );
};

export default CategoryForm;

