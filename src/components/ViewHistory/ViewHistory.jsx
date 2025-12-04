import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { historyAPI } from "../../services/historyAPI";
import "./ViewHistory.css";
import HistoryHeader from "./HistoryHeader";
import HistoryList from "./HistoryList";
import EmptyHistory from "./EmptyHistory";
import logger from "../../utils/logger";

const ViewHistory = ({ onViewDetails, refreshTrigger }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const [viewHistoryCourses, setViewHistoryCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      // ✅ Chỉ load khi user đã đăng nhập
      if (!isLoggedIn) {
        logger.info(
          "VIEW_HISTORY",
          "User not logged in, skipping history load"
        );
        setViewHistoryCourses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        logger.info("VIEW_HISTORY", "Loading recent history from API");

        // Lấy 4 khóa học gần nhất
        const response = await historyAPI.getHistory(1, 4);
        setViewHistoryCourses(response.items || []);

        logger.info("VIEW_HISTORY", "Recent history loaded successfully", {
          itemsCount: response.items?.length,
        });
      } catch (error) {
        logger.error("VIEW_HISTORY", "Error loading recent history", error);
        setViewHistoryCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [isLoggedIn, refreshTrigger]); // Reload khi user login hoặc refreshTrigger thay đổi

  const handleClearHistory = async () => {
    try {
      await historyAPI.clearHistory();
      logger.info("VIEW_HISTORY", "History cleared successfully");
      dispatch({ type: actionTypes.CLEAR_VIEW_HISTORY });
      setViewHistoryCourses([]);
    } catch (error) {
      logger.error("VIEW_HISTORY", "Failed to clear history", error);
      alert("Có lỗi xảy ra khi xóa lịch sử. Vui lòng thử lại!");
    }
  };

  const handleViewAll = () => {
    navigate("/history");
  };

  // Hiển thị loading khi đang fetch dữ liệu
  if (loading) {
    return (
      <div className="view-history-section">
        <HistoryHeader
          showClearButton={false}
          onClearHistory={handleClearHistory}
          onViewAll={handleViewAll}
        />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Đang tải lịch sử xem...</p>
        </div>
      </div>
    );
  }

  if (viewHistoryCourses.length === 0) {
    return (
      <div className="view-history-section">
        <HistoryHeader
          showClearButton={false}
          onClearHistory={handleClearHistory}
          onViewAll={handleViewAll}
        />
        <EmptyHistory />
      </div>
    );
  }

  return (
    <div className="view-history-section">
      <HistoryHeader
        showClearButton={true}
        onClearHistory={handleClearHistory}
        onViewAll={handleViewAll}
        historyCount={viewHistoryCourses.length}
      />
      <HistoryList courses={viewHistoryCourses} onViewDetails={onViewDetails} />
    </div>
  );
};

export default ViewHistory;
