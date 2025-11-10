import React from "react";
import { List, Search } from "lucide-react";
import CategoryTable from "../CategoryTable/CategoryTable";
import "./CategoryList.css";

const CategoryList = ({
  searchTerm,
  onSearchChange,
  categories,
  onEdit,
  onDelete,
}) => {
  return (
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
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </header>

      <CategoryTable
        categories={categories}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  );
};

export default CategoryList;

