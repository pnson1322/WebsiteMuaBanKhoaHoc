import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Search } from "lucide-react";
import "./AdminTransactions.css";
import { adminAPI } from "../../services/api";

const PAGE_SIZE = 4;

// 👉 Skeleton rows (render đúng số dòng  = PAGE_SIZE)
function SkeletonTable({ columns = 5, rows = PAGE_SIZE }) {
  return (
    <table className="tx-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className={i === 0 || i > 2 ? "left" : ""}>
              <div className="sk sk-head" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c} className={c === 0 || c > 2 ? "left" : ""}>
                <div className="sk sk-cell" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function formatVND(n) {
  return n.toLocaleString("vi-VN") + "₫";
}

export default function AdminTransactions() {
  const [activeTab, setActiveTab] = useState("courses"); // 'courses' | 'students'
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Load dữ liệu theo tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res =
          activeTab === "courses"
            ? await adminAPI.getTransactionsByCourse()
            : await adminAPI.getTransactionsByStudent();
        setData(res);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // 🔹 Lọc & tìm kiếm
  const filtered = useMemo(() => {
    let rows = [...data];
    const s = search.trim().toLowerCase();

    if (s) {
      rows =
        activeTab === "courses"
          ? rows.filter(
              (r) =>
                r.id.toLowerCase().includes(s) ||
                r.name.toLowerCase().includes(s)
            )
          : rows.filter(
              (r) =>
                String(r.id).includes(s) || r.name.toLowerCase().includes(s)
            );
    }

    if (activeTab === "courses" && (fromDate || toDate)) {
      rows = rows.filter((r) => {
        const t = new Date(r.lastTransaction.replace(" ", "T"));
        const okFrom = fromDate ? t >= new Date(fromDate) : true;
        const okTo = toDate ? t <= new Date(toDate + "T23:59:59") : true;
        return okFrom && okTo;
      });
    }

    return rows;
  }, [data, search, fromDate, toDate, activeTab]);

  // 🔹 Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  const goto = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  React.useEffect(() => {
    setPage(1);
  }, [activeTab, search, fromDate, toDate]);

  return (
    <div className="tx-wrapper">
      <div className="tx-panel">
        {/* Tabs */}
        <div className="tx-tabs">
          <button
            className={`tx-tab ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen size={18} /> <span>Theo Khóa Học</span>
          </button>
          <button
            className={`tx-tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <GraduationCap size={18} /> <span>Theo Học Viên</span>
          </button>
        </div>

        {/* Filters */}
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
                onChange={(e) => setSearch(e.target.value)}
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
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="tx-filter-col">
                <label className="tx-filter-label">ĐẾN NGÀY</label>
                <input
                  type="date"
                  className="tx-date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="tx-table-wrap">
          {loading ? (
            <SkeletonTable columns={5} rows={PAGE_SIZE} /> // ✅ Hiển thị shimmer skeleton
          ) : (
            <table className="tx-table">
              <thead>
                {activeTab === "courses" ? (
                  <tr>
                    <th className="left">Mã Khóa Học</th>
                    <th className="left">Tên Khóa Học</th>
                    <th>Tổng lượt mua</th>
                    <th className="left">Tổng Doanh Thu</th>
                    <th className="left">Giao Dịch Gần Nhất</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="left">Mã Học Viên</th>
                    <th className="left">Tên Học Viên</th>
                    <th>Tổng lượt mua</th>
                    <th className="left">Tổng Doanh Thu</th>
                    <th className="left">Giao Dịch Gần Nhất</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty">
                      Không có dữ liệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  pageData.map((row) => (
                    <tr key={row.id}>
                      <td className="left">{row.id}</td>
                      <td className="left">{row.name}</td>
                      <td>{row.totalPurchases}</td>
                      <td className="revenue">{formatVND(row.revenue)}</td>
                      <td className="left">{row.lastTransaction}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="tx-pagination">
          <button className="tx-page-btn" onClick={() => goto(pageClamped - 1)}>
            ‹ Trước
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                className={`tx-page-dot ${p === pageClamped ? "active" : ""}`}
                onClick={() => goto(p)}
              >
                {p}
              </button>
            );
          })}
          <button className="tx-page-btn" onClick={() => goto(pageClamped + 1)}>
            Sau ›
          </button>
        </div>
      </div>
    </div>
  );
}
