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

  return (
    <div className="tx-pagination">
      <button
        className="tx-page-btn"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        ‹ Trước
      </button>
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
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




