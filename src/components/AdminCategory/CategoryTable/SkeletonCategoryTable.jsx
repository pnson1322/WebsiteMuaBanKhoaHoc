import React from "react";
import "./SkeletonCategoryTable.css";

const SkeletonCategoryTable = () => {
  return (
    <div className="cat-table">
      <div className="cat-table__header">
        <span>ID</span>
        <span>Tên danh mục</span>
        <span>Ngày tạo</span>
        <span>Thao tác</span>
      </div>

      <div className="cat-table__body">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="cat-row skeleton-row" key={index}>
            <span className="cat-cell skeleton-cell skeleton-id"></span>
            <span className="cat-cell skeleton-cell skeleton-name"></span>
            <span className="cat-cell skeleton-cell skeleton-date"></span>
            <span className="cat-cell skeleton-cell skeleton-actions"></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonCategoryTable;
