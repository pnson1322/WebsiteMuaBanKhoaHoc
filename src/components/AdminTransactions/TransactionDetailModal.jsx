import React from "react";
import "./TransactionDetailModal.css";

function formatVND(n) {
  return n.toLocaleString("vi-VN") + "₫";
}

export default function TransactionDetailModal({ open, onClose, transaction }) {
  if (!open || !transaction) return null;

  const { transactionId, transactionDate, totalAmount, studentName, courseList = [] } =
    transaction;

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
              <div className="tx-info-value">{transactionId}</div>
            </div>
            <div className="tx-info">
              <div className="tx-info-label">Ngày giao dịch</div>
              <div className="tx-info-value">{transactionDate}</div>
            </div>
            <div className="tx-info">
              <div className="tx-info-label">Tổng tiền</div>
              <div className="tx-info-value">{formatVND(totalAmount ?? 0)}</div>
            </div>
            <div className="tx-info">
              <div className="tx-info-label">Học viên</div>
              <div className="tx-info-value">{studentName}</div>
            </div>
          </div>

          <div className="tx-course-section-title">Danh Sách Khóa Học</div>
          <div className="tx-course-list">
            {courseList.map((c, idx) => (
              <div key={idx} className="tx-course-row">
                <div className="tx-course-name">{c.name}</div>
                <div className="tx-course-price">{formatVND(c.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


