import React from "react";
import { Search } from "lucide-react";
import "./AdminTransactions.css";

export default function CourseTransactionFilters({
  search,
  onSearchChange,
}) {
  return (
    <div className="course-tx-filters">
      <div className="tx-filter-col">
        <div className="tx-input course-tx-search">
          <Search size={16} />
          <input
            placeholder="Tìm kiếm học viên"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}





