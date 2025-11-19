import React from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import "./NotificationPopup.css";
import { X, Trash2 } from "lucide-react";

const NotificationIcon = () => (
  <div className="notif-icon-wrapper">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6" />
      <path d="M14 12c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6" />
      <path d="M6 12h8" />
    </svg>
  </div>
);

export default function NotificationPopup({
  notifications,
  onMarkOneAsRead,
  onMarkAllAsRead,
  onDeleteOne,
  onDeleteAll,
}) {
  const handleItemClick = (id, isRead) => {
    if (!isRead) {
      onMarkOneAsRead(id);
    }
  };

  return (
    <div className="notification-popup">
      <div className="notif-header">
        <h3>Thông báo</h3>
        <div className="notif-actions">
          <button
            className="action-text-btn mark-read-btn"
            onClick={onMarkAllAsRead}
            title="Đánh dấu tất cả đã đọc"
          >
            Đã đọc
          </button>
          <span className="divider">|</span>
          <button
            className="action-text-btn delete-all-btn"
            onClick={onDeleteAll}
            title="Xóa tất cả thông báo"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <SimpleBar className="notif-list" style={{ maxHeight: "450px" }}>
        {notifications.length === 0 ? (
          <div className="notif-empty">Bạn không có thông báo nào.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.isRead ? "unread" : ""}`}
              onClick={() => handleItemClick(notif.id, notif.isRead)}
            >
              <NotificationIcon />

              <div className="notif-content">
                <p className="notif-text">{notif.text}</p>
                <span className="notif-time">{notif.date}</span>
              </div>

              {!notif.isRead && <div className="notif-unread-dot" />}

              <button
                className="notif-delete-item-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOne(notif.id);
                }}
                title="Xóa thông báo này"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </SimpleBar>
    </div>
  );
}
