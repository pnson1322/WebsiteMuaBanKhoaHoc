import React, { useEffect, useMemo, useState } from "react";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import CategoryForm from "../../components/AdminCategory/CategoryForm/CategoryForm";
import CategoryList from "../../components/AdminCategory/CategoryList/CategoryList";
import EditCategoryModal from "../../components/AdminCategory/EditCategoryModal/EditCategoryModal";
import DeleteCategoryModal from "../../components/AdminCategory/DeleteCategoryModal/DeleteCategoryModal";
import "./AdminCategories.css";
import { categoryAPI } from "../../services/categoryAPI";

const AdminCategories = () => {
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState(null);
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryAPI.getAll();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword)
    );
  }, [categories, searchTerm]);

  const handleAddCategory = async (event) => {
    event.preventDefault();

    const name = newCategory.trim();
    if (!name) return;

    const ok = await categoryAPI.createCategory(name);
    if (ok) {
      const data = await categoryAPI.getAll(); // reload list
      setCategories(data);
      setNewCategory("");
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditingName("");
  };

  const handleUpdateCategory = async (event) => {
    event.preventDefault();
    if (!editingCategory) return;

    const name = editingName.trim();
    if (!name) return;

    const ok = await categoryAPI.updateCategory(editingCategory.id, name);
    if (ok) {
      const data = await categoryAPI.getAll();
      setCategories(data);
    }

    closeEditModal();
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
  };

  const closeDeleteModal = () => {
    setDeletingCategory(null);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    const ok = await categoryAPI.deleteCategory(deletingCategory.id);
    if (ok) {
      const data = await categoryAPI.getAll();
      setCategories(data);
    }

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
