import React from "react";
import "./LoadingSkeleton.css";

export const CourseCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-category"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description" style={{ width: "70%" }}></div>
        <div className="skeleton-price-row">
          <div className="skeleton-price"></div>
          <div className="skeleton-rating"></div>
        </div>
        <div className="skeleton-buttons">
          <div className="skeleton-button"></div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div className="skeleton-button" style={{ flex: 1 }}></div>
            <div
              className="skeleton-button"
              style={{ width: "42px", flex: "none" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SuggestionsSkeleton = () => {
  return (
    <div className="suggestions-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title-large"></div>
      </div>
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const ChatMessageSkeleton = () => {
  return (
    <div className="message bot-message">
      <div className="message-avatar">
        <div className="skeleton-avatar"></div>
      </div>
      <div className="message-content">
        <div className="skeleton-chat-text"></div>
        <div className="skeleton-courses">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-chat-course">
              <div className="skeleton-course-thumb"></div>
              <div className="skeleton-course-info">
                <div className="skeleton-course-title"></div>
                <div className="skeleton-course-desc"></div>
                <div className="skeleton-course-price"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HistoryPageSkeleton = () => {
  return (
    <div className="history-page">
      <div className="container">
        {/* Header Skeleton */}
        <div className="history-header">
          <div className="skeleton-back-btn"></div>

          <div className="header-content">
            <div className="title-section">
              <div className="skeleton-icon"></div>
              <div className="skeleton-title-large"></div>
              <div className="skeleton-count"></div>
            </div>

            <div className="header-actions">
              <div className="skeleton-search-box"></div>
              <div className="skeleton-clear-btn"></div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="history-content">
          <div className="skeleton-results-info"></div>

          <div className="courses-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UsersTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="users-table-container">
      <h3 className="users-table-title">Danh sách người dùng</h3>
      <div className="users-table">
        <div className="users-table__header">
          <span>ID</span>
          <span>Họ tên</span>
          <span>Email</span>
          <span>Vai trò</span>
          <span>Ngày tạo</span>
          <span>Thao tác</span>
        </div>

        <div className="users-table__body">
          {Array.from({ length: rows }).map((_, index) => (
            <div className="users-row skeleton-row" key={index}>
              <span className="users-cell">
                <div className="skeleton skeleton-cell-id"></div>
              </span>
              <span className="users-cell">
                <div className="skeleton skeleton-cell-name"></div>
              </span>
              <span className="users-cell">
                <div className="skeleton skeleton-cell-email"></div>
              </span>
              <span className="users-cell">
                <div className="skeleton skeleton-cell-role"></div>
              </span>
              <span className="users-cell">
                <div className="skeleton skeleton-cell-date"></div>
              </span>
              <span className="users-cell users-cell--actions">
                <div className="skeleton skeleton-cell-action"></div>
                <div className="skeleton skeleton-cell-action"></div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
