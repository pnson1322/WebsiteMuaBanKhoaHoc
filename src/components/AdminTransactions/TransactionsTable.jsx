import React from "react";
import "./AdminTransactions.css";

function formatVND(n) {
  return n.toLocaleString("vi-VN") + "₫";
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
          ) : (
            data.map((row) => (
              <tr key={row.id}>
                <td className="left">{row.id}</td>
                <td className="left">{row.name}</td>
                <td>{row.totalPurchases}</td>
                <td className="revenue">{formatVND(row.revenue)}</td>
                <td className="left">{row.lastTransaction}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


