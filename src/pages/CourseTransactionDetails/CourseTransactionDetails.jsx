import React, { useEffect, useMemo, useState } from "react";
import "./CourseTransactionDetails.css";
import { adminAPI } from "../../services/api";
import SkeletonTable from "../../components/SkeletonTable/SkeletonTable";
import CourseTransactionFilters from "../../components/AdminTransactions/CourseTransactionFilters";
import CourseTransactionDetailsTable from "../../components/AdminTransactions/CourseTransactionDetailsTable";
import Pagination from "../../components/common/Pagination";
import TransactionDetailModal from "../../components/AdminTransactions/TransactionDetailModal";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 6;

export default function CourseTransactionDetails() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  // 🔹 Load toàn bộ giao dịch (nhiều khóa học)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAllTransactions(); // ✅ API mới
        setData(res);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Lọc & tìm kiếm
  const filtered = useMemo(() => {
    let rows = [...data];
    const s = search.trim().toLowerCase();
    if (s) {
      rows = rows.filter(
        (r) =>
          r.transactionId.toLowerCase().includes(s) ||
          r.studentName.toLowerCase().includes(s) ||
          r.courseList.some((c) => c.name.toLowerCase().includes(s))
      );
    }
    return rows;
  }, [data, search]);

  // 🔹 Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="course-tx-details-wrapper">
      <div className="course-tx-details-panel">
        <div className="course-tx-header">
          <h1 className="course-tx-title">
            📊 Thông Tin Giao Dịch Toàn Bộ Khóa Học
          </h1>
          <CourseTransactionFilters
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div className="course-tx-content">
          {loading ? (
            <div className="tx-table-wrap">
              <SkeletonTable columns={5} rows={PAGE_SIZE} />
            </div>
          ) : (
            <CourseTransactionDetailsTable
              data={pageData}
              onSelect={(row) => {
                setSelected(row);
                setOpen(true);
              }}
            />
          )}

          <Pagination
            currentPage={pageClamped}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <button
            className="course-tx-close-btn"
            onClick={() => navigate("/transactions")}
          >
            Đóng
          </button>
        </div>
      </div>
      <TransactionDetailModal
        open={open}
        transaction={selected}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
