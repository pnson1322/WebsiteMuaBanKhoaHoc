import React from "react";
import { Clock, Trash2 } from "lucide-react";

const HistoryHeader = ({ showClearButton, onClearHistory, historyCount }) => {
  return (
    <div className="view-history-header">
      <div className="section-title">
        <Clock className="section-icon" />
        <h3>📚 Lịch sử xem gần đây</h3>
        {historyCount !== undefined && (
          <span className="history-count">{historyCount}</span>
        )}
      </div>
      {showClearButton && (
        <button
          className="clear-history-btn"
          onClick={onClearHistory}
        >
          <Trash2 className="trash-icon" /> Xóa lịch sử
        </button>
      )}
    </div>
  );
};

export default HistoryHeader;
