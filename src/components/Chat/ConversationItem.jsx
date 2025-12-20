import React from "react";

// Bọc bằng React.memo để chặn re-render không cần thiết
const ConversationItem = React.memo(
  ({ conversation, isActive, onSelect }) => {
    const isUnread = conversation.unreadCount > 0;

    return (
      <div
        className={`conversation-item ${isActive ? "active" : ""} ${isUnread ? "unread" : ""}`}
        // Khi click, nó sẽ gửi conversation.raw (đã chứa isBlock mới nhất) sang cha
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
            <h3 className="name">
              {conversation.studentName}
            </h3>
            <span className={`time ${isUnread ? "unread-time" : ""}`}>
              {conversation.formattedTime}
            </span>
          </div>

          <div className="bottom-row">
            {/* Hiển thị tin nhắn bình thường, không hiện "Đã chặn tin nhắn" */}
            <p className="message-preview">
              {conversation.lastMessage}
            </p>
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
    // 🔥 QUAN TRỌNG: Vẫn CẦN giữ đoạn check này.
    // Tại sao? Dù giao diện không đổi, nhưng dữ liệu `conversation.raw` bên trong đã đổi (isBlock: true/false).
    // Nếu không check dòng này, component sẽ không re-render -> hàm onClick vẫn giữ dữ liệu cũ (isBlock: false).
    // Re-render ở đây để đảm bảo khi click vào, MessagePanel nhận được trạng thái mới nhất.
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.conversation.id === nextProps.conversation.id &&
      prevProps.conversation.unreadCount === nextProps.conversation.unreadCount &&
      prevProps.conversation.lastMessage === nextProps.conversation.lastMessage &&
      prevProps.conversation.raw?.isBlock === nextProps.conversation.raw?.isBlock
    );
  }
);

export default ConversationItem;