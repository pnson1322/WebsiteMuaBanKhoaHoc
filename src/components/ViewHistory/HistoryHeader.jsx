import React from "react";
import { Clock, Trash2, ArrowRight } from "lucide-react";

const HistoryHeader = ({
  showClearButton,
  onClearHistory,
  onViewAll,
  historyCount,
}) => (
  <div className="view-history-header">
    <div className="section-title">
      <Clock className="section-icon" />
      <h3>📚 Lịch sử xem gần đây</h3>
      {historyCount && <span className="history-count">({historyCount})</span>}
    </div>

    {showClearButton && (
      <div className="header-actions">
        <button className="view-all-btn" onClick={onViewAll}>
          Xem tất cả <ArrowRight className="arrow-icon" />
        </button>

        <button className="clear-history-btn" onClick={onClearHistory}>
          <Trash2 className="trash-icon" /> Xóa lịch sử
        </button>
      </div>
    )}
  </div>
);

export default HistoryHeader;


