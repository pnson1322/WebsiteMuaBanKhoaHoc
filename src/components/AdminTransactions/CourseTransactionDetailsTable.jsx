import React from "react";
import "./AdminTransactions.css";

function formatVND(n) {
  return (n ?? 0).toLocaleString("vi-VN") + "₫";
}

export default function CourseTransactionDetailsTable({ data = [], onSelect }) {
  return (
    <div className="tx-table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th className="left">MÃ GIAO DỊCH</th>
            <th className="left">HỌC VIÊN</th>
            <th className="left">TỔNG TIỀN</th>
            <th className="left">NGÀY GIAO DỊCH</th>
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
              <tr key={row.transactionCode || i}>
                <td className="left">
                  <button
                    className="tx-link"
                    onClick={() => onSelect && onSelect(row)}
                  >
                    {row.transactionCode}
                  </button>
                </td>
                <td className="left">{row.buyerName}</td>
                <td className="revenue">{formatVND(row.totalAmount)}</td>
                <td className="left">
                  {new Date(row.createdAt).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
