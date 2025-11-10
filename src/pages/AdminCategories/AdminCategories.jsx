import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit2,
  List,
  PlusCircle,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import "./AdminCategories.css";

const initialCategories = [
  { id: 1, name: "Lập Trình Web", createdAt: "2024-01-15" },
  { id: 2, name: "Mobile Development", createdAt: "2024-01-16" },
  { id: 3, name: "Data Science", createdAt: "2024-01-17" },
  { id: 4, name: "UI/UX Design", createdAt: "2024-01-18" },
  { id: 5, name: "Digital Marketing", createdAt: "2024-01-19" },
];

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch (error) {
    return date;
  }
};

const AdminCategories = () => {
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState(null);

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword)
    );
  }, [categories, searchTerm]);

  const handleAddCategory = (event) => {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return;

    const nextId =
      categories.reduce((maxId, category) => Math.max(maxId, category.id), 0) +
      1;

    setCategories((prev) => [
      ...prev,
      {
        id: nextId,
        name,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewCategory("");
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditingName("");
  };

  const handleUpdateCategory = (event) => {
    event.preventDefault();
    if (!editingCategory) return;

    const name = editingName.trim();
    if (!name) return;

    setCategories((prev) =>
      prev.map((item) =>
        item.id === editingCategory.id ? { ...item, name } : item
      )
    );
    closeEditModal();
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
  };

  const closeDeleteModal = () => {
    setDeletingCategory(null);
  };

  const confirmDeleteCategory = () => {
    if (!deletingCategory) return;

    setCategories((prev) =>
      prev.filter((item) => item.id !== deletingCategory.id)
    );
    closeDeleteModal();
  };

  useEffect(() => {
    if (!editingCategory && !deletingCategory) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (editingCategory) {
          closeEditModal();
        }
        if (deletingCategory) {
          closeDeleteModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingCategory, deletingCategory]);

  return (
    <div className="cat-wrapper">
      <SellerStatsHeader
        title="📚 Quản lý danh mục"
        subtitle="Thêm, chỉnh sửa và xóa các danh mục khóa học"
      />

      <div className="cat-content">
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

          <form className="cat-form" onSubmit={handleAddCategory}>
            <label htmlFor="category-name">
              Tên danh mục <span>*</span>
            </label>
            <input
              id="category-name"
              type="text"
              value={newCategory}
              placeholder="Nhập tên danh mục..."
              onChange={(event) => setNewCategory(event.target.value)}
            />

            <button type="submit" className="cat-primary-btn">
              Thêm Danh Mục
            </button>
          </form>

          <footer className="cat-summary">
            <span>Tổng số danh mục:</span>
            <strong>{categories.length}</strong>
          </footer>
        </section>

        <section className="cat-card cat-card--list">
          <header className="cat-card__header cat-card__header--list">
            <div className="cat-card__title">
              <List size={20} />
              <h2>Danh Sách Danh Mục</h2>
            </div>

            <div className="cat-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </header>

          <div className="cat-table">
            <div className="cat-table__header">
              <span>ID</span>
              <span>Tên danh mục</span>
              <span>Ngày tạo</span>
              <span>Thao tác</span>
            </div>

            <div className="cat-table__body">
              {filteredCategories.length === 0 ? (
                <div className="cat-empty">
                  Không tìm thấy danh mục phù hợp.
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div className="cat-row" key={category.id}>
                    <span className="cat-cell cat-cell--id">
                      #{category.id}
                    </span>

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
                        onClick={() => openEditModal(category)}
                        aria-label={`Sửa danh mục ${category.name}`}
                      >
                        <Edit2 size={16} />
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="cat-action cat-action--delete"
                        onClick={() => openDeleteModal(category)}
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
        </section>
      </div>

      {editingCategory && (
        <div
          className="cat-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-category-title"
          onClick={closeEditModal}
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

            <form className="cat-modal__form" onSubmit={handleUpdateCategory}>
              <label htmlFor="edit-category-name">
                Tên danh mục <span>*</span>
              </label>
              <input
                id="edit-category-name"
                type="text"
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                placeholder="Nhập tên danh mục..."
                autoFocus
              />

              <div className="cat-modal__actions">
                <button
                  type="button"
                  className="cat-btn cat-btn--ghost"
                  onClick={closeEditModal}
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
      )}

      {deletingCategory && (
        <div
          className="cat-modal-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
          onClick={closeDeleteModal}
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
                onClick={closeDeleteModal}
              >
                Hủy
              </button>
              <button
                type="button"
                className="cat-btn cat-btn--danger"
                onClick={confirmDeleteCategory}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;


