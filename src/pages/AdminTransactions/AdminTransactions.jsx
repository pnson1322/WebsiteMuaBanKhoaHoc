import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import "./AdminTransactions.css";
import SkeletonTable from "../../components/SkeletonTable/SkeletonTable";
import TransactionsFilters from "../../components/AdminTransactions/TransactionsFilters";
import TransactionsTable from "../../components/AdminTransactions/TransactionsTable";
import Pagination from "../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import { transactionAPI } from "../../services/transactionAPI"; // ✅ import mới

const PAGE_SIZE = 4;

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Gọi API thật (theo tab)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === "courses") {
          res = await transactionAPI.getTransactionsByCourses(page, PAGE_SIZE);
        } else {
          res = await transactionAPI.getTransactionsByStudents(page, PAGE_SIZE);
        }
        setData(res.items || []);
        setTotalCount(res.totalCount || 0);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, page]);

  // 🔹 Lọc và tìm kiếm (client-side)
  const filtered = useMemo(() => {
    let rows = [...data];
    const s = search.trim().toLowerCase();

    if (s) {
      rows =
        activeTab === "courses"
          ? rows.filter(
              (r) =>
                String(r.courseId).includes(s) ||
                r.courseTitle.toLowerCase().includes(s)
            )
          : rows.filter(
              (r) =>
                String(r.studentId).includes(s) ||
                r.fullName.toLowerCase().includes(s)
            );
    }

    if ((fromDate || toDate) && activeTab === "courses") {
      rows = rows.filter((r) => {
        const t = new Date(r.lastTransactionDate);
        const okFrom = fromDate ? t >= new Date(fromDate) : true;
        const okTo = toDate ? t <= new Date(toDate + "T23:59:59") : true;
        return okFrom && okTo;
      });
    }

    return rows;
  }, [data, search, fromDate, toDate, activeTab]);

  // 🔹 Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  useEffect(() => {
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
          <TransactionsTable activeTab={activeTab} data={filtered} />
        )}

        {/* Pagination */}
        <div className="tx-pagination-row">
          <Pagination
            currentPage={page}
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
