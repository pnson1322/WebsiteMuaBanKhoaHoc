import React from "react";
import "./AdminTransactions.css";

function formatVND(n) {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toLocaleString("vi-VN") + "₫";
}

export default function TransactionsTable({ activeTab, data }) {
  return (
    <div className="tx-table-wrap">
      <table className="tx-table">
        <thead>
          {activeTab === "courses" ? (
            <tr>
              <th className="left">Mã Khóa Học</th>
              <th className="left">Tên Khóa Học</th>
              <th>Tổng lượt mua</th>
              <th className="left">Tổng Doanh Thu</th>
              <th className="left">Giao Dịch Gần Nhất</th>
            </tr>
          ) : (
            <tr>
              <th className="left">Mã Học Viên</th>
              <th className="left">Tên Học Viên</th>
              <th>Tổng lượt mua</th>
              <th className="left">Tổng Doanh Thu</th>
              <th className="left">Giao Dịch Gần Nhất</th>
            </tr>
          )}
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          ) : activeTab === "courses" ? (
            data.map((row) => (
              <tr key={row.courseId}>
                <td className="left">{row.courseId}</td>
                <td className="left">{row.courseTitle}</td>
                <td>{row.purchaseCount}</td>
                <td className="revenue">{formatVND(row.totalRevenue)}</td>
                <td className="left">
                  {new Date(row.lastTransactionDate).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))
          ) : (
            data.map((row) => (
              <tr key={row.studentId}>
                <td className="left">{row.studentId}</td>
                <td className="left">{row.fullName}</td>
                <td>{row.purchaseCount}</td>
                <td className="revenue">{formatVND(row.totalRevenue)}</td>
                <td className="left">
                  {new Date(row.lastTransactionDate).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
