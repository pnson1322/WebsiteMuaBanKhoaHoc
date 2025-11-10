import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import "./AdminTransactions.css";
import { adminAPI } from "../../services/api";
import SkeletonTable from "../../components/SkeletonTable/SkeletonTable";
import TransactionsFilters from "../../components/AdminTransactions/TransactionsFilters";
import TransactionsTable from "../../components/AdminTransactions/TransactionsTable";
import Pagination from "../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";

const PAGE_SIZE = 4;

export default function AdminTransactions() {
  const navigate = useNavigate();
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  React.useEffect(() => {
    setPage(1);
  }, [activeTab, search, fromDate, toDate]);

  return (
    <div className="tx-wrapper">
      <SellerStatsHeader title="📚 Quản lý giao dịch" subtitle="" />
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
        <TransactionsFilters
          activeTab={activeTab}
          search={search}
          onSearchChange={setSearch}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
        />

        {/* Table */}
        {loading ? (
          <div className="tx-table-wrap">
            <SkeletonTable columns={5} rows={PAGE_SIZE} />
          </div>
        ) : (
          <TransactionsTable activeTab={activeTab} data={pageData} />
        )}

        {/* Pagination + Action */}
        <div className="tx-pagination-row">
          <Pagination
            currentPage={pageClamped}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <button
            className="tx-open-btn"
            onClick={() => navigate("/course-transactions/details")}
          >
            Xem chi tiết giao dịch
          </button>
        </div>
      </div>
    </div>
  );
}
