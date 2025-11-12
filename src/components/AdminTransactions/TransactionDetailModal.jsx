import React from "react";
import "./TransactionDetailModal.css";

function formatVND(n) {
  return (n ?? 0).toLocaleString("vi-VN") + "₫";
}

export default function TransactionDetailModal({ open, onClose, transaction }) {
  if (!open || !transaction) return null;

  const { transactionCode, createdAt, buyerName, totalAmount, courses = [] } = transaction;

  return (
    <div className="tx-modal-overlay" onClick={onClose}>
      <div className="tx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <div className="tx-modal-title">Chi Tiết Giao Dịch</div>
          <button className="tx-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tx-modal-body">
          <div className="tx-grid">
            <div className="tx-info">
              <div className="tx-info-label">Mã giao dịch</div>
              <div className="tx-info-value">{transactionCode}</div>
            </div>
            <div className="tx-info">
              <div className="tx-info-label">Ngày giao dịch</div>
              <div className="tx-info-value">
                {new Date(createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
            <div className="tx-info">
              <div className="tx-info-label">Học viên</div>
              <div className="tx-info-value">{buyerName}</div>
            </div>
            <div className="tx-info">
              <div className="tx-info-label">Tổng tiền</div>
              <div className="tx-info-value">{formatVND(totalAmount)}</div>
            </div>
          </div>

          <div className="tx-course-section-title">Danh Sách Khóa Học</div>
          <div className="tx-course-list">
            {courses.map((c, idx) => (
              <div key={idx} className="tx-course-row">
                <div className="tx-course-name">{c.courseName}</div>
                <div className="tx-course-price">{formatVND(c.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
