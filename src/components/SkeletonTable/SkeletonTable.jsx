import React from "react";
import "./SkeletonTable.css";
import "../AdminTransactions/AdminTransactions.css";

export default function SkeletonTable({ columns = 5, rows = 4 }) {
  return (
    <table className="tx-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className={i === 0 || i > 2 ? "left" : ""}>
              <div className="sk sk-head" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c} className={c === 0 || c > 2 ? "left" : ""}>
                <div className="sk sk-cell" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

