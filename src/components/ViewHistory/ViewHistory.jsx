import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { coursesAPI } from "../../services/api";
import "./ViewHistory.css";
import HistoryHeader from "./HistoryHeader";
import HistoryList from "./HistoryList";
import EmptyHistory from "./EmptyHistory";

const ViewHistory = ({ onViewDetails }) => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const [viewHistoryCourses, setViewHistoryCourses] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const recentIds = state.viewHistory.slice(0, 4); // ✅ mới nhất ở đầu
      const courses = await Promise.all(
        recentIds.map((id) => coursesAPI.getCourseById(id).catch(() => null))
      );
      setViewHistoryCourses(courses.filter(Boolean));
    };
    loadHistory();
  }, [state.viewHistory]);

  const handleClearHistory = () => {
    dispatch({ type: actionTypes.CLEAR_VIEW_HISTORY });
  };

  const handleViewAll = () => {
    navigate("/history");
  };

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



