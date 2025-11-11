import React, { useEffect, useMemo, useState } from "react";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import CategoryForm from "../../components/AdminCategory/CategoryForm/CategoryForm";
import CategoryList from "../../components/AdminCategory/CategoryList/CategoryList";
import EditCategoryModal from "../../components/AdminCategory/EditCategoryModal/EditCategoryModal";
import DeleteCategoryModal from "../../components/AdminCategory/DeleteCategoryModal/DeleteCategoryModal";
import "./AdminCategories.css";

const initialCategories = [
  { id: 1, name: "Lập Trình Web", createdAt: "2024-01-15" },
  { id: 2, name: "Mobile Development", createdAt: "2024-01-16" },
  { id: 3, name: "Data Science", createdAt: "2024-01-17" },
  { id: 4, name: "UI/UX Design", createdAt: "2024-01-18" },
  { id: 5, name: "Digital Marketing", createdAt: "2024-01-19" },
];

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
        <CategoryForm
          newCategory={newCategory}
          onCategoryChange={setNewCategory}
          onSubmit={handleAddCategory}
          totalCategories={categories.length}
        />

        <CategoryList
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={filteredCategories}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      <EditCategoryModal
        category={editingCategory}
        editingName={editingName}
        onNameChange={setEditingName}
        onClose={closeEditModal}
        onSubmit={handleUpdateCategory}
      />

      <DeleteCategoryModal
        category={deletingCategory}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
};

export default AdminCategories;


