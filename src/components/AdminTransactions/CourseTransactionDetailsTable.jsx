import React from "react";
import "./AdminTransactions.css";

// 🧮 Định dạng tiền VND an toàn (tránh lỗi undefined)
function formatVND(n) {
  return n.toLocaleString("vi-VN") + "₫";
}
export default function CourseTransactionDetailsTable({ data = [], onSelect }) {
  return (
    <div className="tx-table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th className="left">MÃ GD</th>
            <th className="left">HỌC VIÊN</th>
            <th className="left">TỔNG TIỀN</th>
            <th className="left">NGÀY GD</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty">
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.transactionId || row.id || i}>
                <td className="left">
                  <button
                    className="tx-link"
                    onClick={() => onSelect && onSelect(row)}
                    title="Xem chi tiết giao dịch"
                  >
                    {row.transactionId || row.id}
                  </button>
                </td>
                <td className="left">{row.studentName || row.name}</td>

                {/* ✅ Dùng totalAmount nếu có (multi-course) hoặc price/amount nếu là single */}
                <td className="revenue">
                  {formatVND(
                    row.totalAmount ?? row.amount ?? row.price ?? 0 // fallback để không bị undefined
                  )}
                </td>

                <td className="left">
                  {row.transactionDate || row.date || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

