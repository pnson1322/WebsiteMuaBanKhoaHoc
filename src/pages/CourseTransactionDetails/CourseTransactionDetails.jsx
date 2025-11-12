import React, { useEffect, useMemo, useState } from "react";
import "./CourseTransactionDetails.css";
import { transactionAPI } from "../../services/transactionAPI";
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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  // 🔹 Gọi API khi thay đổi trang
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await transactionAPI.getTransactions(page, PAGE_SIZE);
        setData(res.items || []);
        setTotalCount(res.totalCount || 0);
      } catch (err) {
        console.error("Lỗi khi tải danh sách giao dịch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page]);

  // 🔹 Tìm kiếm (client-side)
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (r) =>
        r.transactionCode.toLowerCase().includes(s) ||
        r.buyerName.toLowerCase().includes(s)
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // 🔹 Mở modal chi tiết
  const handleSelect = async (row) => {
    try {
      setLoading(true);
      const res = await transactionAPI.getTransactionByCode(row.transactionCode);
      setSelected(res);
      setOpen(true);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết giao dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-tx-details-wrapper">
      <div className="course-tx-details-panel">
        <div className="course-tx-header">
          <h1 className="course-tx-title">📊 Thông Tin Giao Dịch</h1>
          <CourseTransactionFilters
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div className="course-tx-content">
          {loading ? (
            <div className="tx-table-wrap">
              <SkeletonTable columns={4} rows={PAGE_SIZE} />
            </div>
          ) : (
            <CourseTransactionDetailsTable data={filtered} onSelect={handleSelect} />
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          <button className="course-tx-close-btn" onClick={() => navigate("/transactions")}>
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
