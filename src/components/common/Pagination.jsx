import React from "react";
import "./Pagination.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Tính toán các trang cần hiển thị
  const getVisiblePages = () => {
    const maxVisible = 5; // Số trang tối đa hiển thị (không tính ... và trang đầu/cuối)
    const pages = [];

    if (totalPages <= maxVisible + 2) {
      // Nếu tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      // Tính vị trí bắt đầu và kết thúc của dãy số giữa
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Điều chỉnh để luôn hiển thị đủ số trang
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, maxVisible - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 2);
      }

      // Thêm ... nếu cần ở đầu
      if (start > 2) {
        pages.push("...");
      }

      // Thêm các trang ở giữa
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Thêm ... nếu cần ở cuối
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Luôn hiển thị trang cuối
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="tx-pagination">
      <button
        className="tx-page-btn"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        ‹ Trước
      </button>
      {visiblePages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="tx-page-ellipsis">
              ...
            </span>
          );
        }
        return (
          <button
            key={page}
            className={`tx-page-dot ${page === currentPage ? "active" : ""}`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        );
      })}
      <button
        className="tx-page-btn"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Sau ›
      </button>
    </div>
  );
}
