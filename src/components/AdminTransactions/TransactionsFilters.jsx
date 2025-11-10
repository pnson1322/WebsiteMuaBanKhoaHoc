import React from "react";
import { Search } from "lucide-react";
import "./AdminTransactions.css";

export default function TransactionsFilters({
  activeTab,
  search,
  onSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}) {
  return (
    <div className="tx-filters">
      <div className="tx-filter-col">
        <label className="tx-filter-label">
          {activeTab === "courses"
            ? "TÌM KIẾM KHÓA HỌC"
            : "TÌM KIẾM HỌC VIÊN"}
        </label>
        <div className="tx-input">
          <Search size={16} />
          <input
            placeholder={
              activeTab === "courses"
                ? "Nhập tên khóa học..."
                : "Nhập tên học viên"
            }
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {activeTab === "courses" && (
        <div className="tx-filter-group">
          <div className="tx-filter-col">
            <label className="tx-filter-label">TỪ NGÀY</label>
            <input
              type="date"
              className="tx-date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
            />
          </div>
          <div className="tx-filter-col">
            <label className="tx-filter-label">ĐẾN NGÀY</label>
            <input
              type="date"
              className="tx-date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}


