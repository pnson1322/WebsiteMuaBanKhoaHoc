import React from "react";

// Bọc bằng React.memo để chặn re-render không cần thiết
const ConversationItem = React.memo(
  ({ conversation, isActive, onSelect }) => {
    const isUnread = conversation.unreadCount > 0;

    return (
      <div
        className={`conversation-item ${isActive ? "active" : ""} ${
          isUnread ? "unread" : ""
        }`}
        onClick={() => onSelect(conversation.raw)}
      >
        <div className="avatar-wrapper">
          <img
            src={
              conversation.studentAvatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                conversation.studentName
              )}&background=random&color=fff`
            }
            alt={conversation.studentName}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                conversation.studentName
              )}&background=random&color=fff`;
            }}
          />
          {conversation.isOnline && <span className="online-dot"></span>}
        </div>

        <div className="content-wrapper">
          <div className="top-row">
            <h3 className="name">{conversation.studentName}</h3>
            <span className={`time ${isUnread ? "unread-time" : ""}`}>
              {conversation.formattedTime}
            </span>
          </div>

          <div className="bottom-row">
            <p className="message-preview">{conversation.lastMessage}</p>
            {conversation.unreadCount > 0 && (
              <span className="unread-dot"></span>
            )}
          </div>

          {conversation.courseName && (
            <div className="course-badge">📖 {conversation.courseName}</div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom check (tùy chọn): Chỉ re-render khi:
    // 1. ID thay đổi (khác item)
    // 2. Trạng thái active thay đổi (item này vừa được chọn hoặc vừa bị bỏ chọn)
    // 3. Số tin nhắn chưa đọc thay đổi
    // 4. Tin nhắn cuối cùng thay đổi
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.conversation.id === nextProps.conversation.id &&
      prevProps.conversation.unreadCount ===
        nextProps.conversation.unreadCount &&
      prevProps.conversation.lastMessage === nextProps.conversation.lastMessage
    );
  }
);

export default ConversationItem;
