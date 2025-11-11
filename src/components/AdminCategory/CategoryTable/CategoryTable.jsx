import React from "react";
import { Edit2, Tag, Trash2 } from "lucide-react";
import { formatDate } from "../../../pages/AdminCategories/utils";
import "./CategoryTable.css";

const CategoryTable = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="cat-table">
      <div className="cat-table__header">
        <span>ID</span>
        <span>Tên danh mục</span>
        <span>Ngày tạo</span>
        <span>Thao tác</span>
      </div>

      <div className="cat-table__body">
        {categories.length === 0 ? (
          <div className="cat-empty">
            Không tìm thấy danh mục phù hợp.
          </div>
        ) : (
          categories.map((category) => (
            <div className="cat-row" key={category.id}>
              <span className="cat-cell cat-cell--id">#{category.id}</span>

              <span className="cat-cell cat-cell--name">
                <Tag size={18} />
                {category.name}
              </span>

              <span className="cat-cell cat-cell--date">
                {formatDate(category.createdAt)}
              </span>

              <span className="cat-cell cat-cell--actions">
                <button
                  type="button"
                  className="cat-action cat-action--edit"
                  onClick={() => onEdit(category)}
                  aria-label={`Sửa danh mục ${category.name}`}
                >
                  <Edit2 size={16} />
                  Sửa
                </button>
                <button
                  type="button"
                  className="cat-action cat-action--delete"
                  onClick={() => onDelete(category)}
                  aria-label={`Xóa danh mục ${category.name}`}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryTable;

