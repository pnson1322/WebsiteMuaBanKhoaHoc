import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "./MessagePanel.css";

const MessagePanel = () => {
  const {
    activeConversation,
    messages,
    sendMessage,
    loading,
    isConnected,
    typingUsers,
    onlineUsers,
    sendTyping,
  } = useChat();

  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Logic cuộn xuống cuối đơn giản như code cũ của bạn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cuộn khi có tin nhắn mới hoặc typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus();
    }
  }, [activeConversation]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (!activeConversation) return;

    if (value.trim().length > 0) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTyping(activeConversation.id, true);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(activeConversation.id, false);
      }, 1500);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTyping(activeConversation.id, false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      setSending(true);
      await sendMessage(activeConversation.id, inputMessage, []);
      setInputMessage("");
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: vi });
    } catch {
      return "";
    }
  };

  if (!activeConversation) {
    return (
      <div className="msg-panel-empty">
        <div className="msg-empty-content">
          <div className="msg-empty-icon" style={{ opacity: "1" }}>
            📭
          </div>
          <h2>Chào mừng trở lại!</h2>
          <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
        </div>
      </div>
    );
  }

  const studentName = activeConversation.buyerName || "Người dùng";
  const studentAvatar =
    activeConversation.buyerAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      studentName
    )}&background=random&color=fff`;
  const courseName = activeConversation.courseTitle || "";
  const sellerId = activeConversation.sellerId;
  const partnerId = activeConversation.buyerId;
  const isPartnerTyping = typingUsers && typingUsers[partnerId];
  const isOnline = onlineUsers[partnerId];

  return (
    <div className="msg-panel-container">
      {/* --- HEADER --- */}
      <div className="msg-panel-header">
        <div className="msg-header-left">
          <div className="msg-avatar-group">
            <img
              src={studentAvatar}
              alt={studentName}
              className="msg-header-avatar"
            />
            {isOnline && <span className="msg-status-dot online" />}
          </div>
          <div className="msg-user-info">
            <h3 className="msg-user-name">{studentName}</h3>
            <span className={`msg-user-status ${isOnline ? "online" : ""}`}>
              {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
            </span>
          </div>
        </div>

        {courseName && (
          <div className="msg-header-right">
            <div className="msg-course-badge" title={courseName}>
              <span className="msg-course-icon">🎓</span>
              <span className="msg-course-title">{courseName}</span>
            </div>
          </div>
        )}
      </div>

      {/* --- MESSAGES LIST --- */}
      <div className="msg-list-container scrollable-content">
        {loading && messages.length === 0 ? (
          <div className="msg-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="msg-list-wrapper">
            {messages.map((message, index) => {
              const isSeller = message.senderId === sellerId;

              // Logic: Avatar nằm ở tin cuối cùng của nhóm
              const isLastInGroup =
                index === messages.length - 1 ||
                messages[index + 1].senderId !== message.senderId;

              const showAvatar = !isSeller && isLastInGroup;

              return (
                <div
                  key={message.id}
                  className={`msg-row ${
                    isSeller ? "msg-sent" : "msg-received"
                  }`}
                >
                  <div className="msg-row-avatar-col">
                    {!isSeller && showAvatar && (
                      <img
                        src={studentAvatar}
                        alt=""
                        className="msg-chat-avatar"
                      />
                    )}
                  </div>

                  <div className="msg-content-col">
                    <div className="msg-bubble">
                      {message.content && (
                        <div className="msg-text">{message.content}</div>
                      )}

                      {message.attachments?.length > 0 && (
                        <div className="msg-attachments-grid">
                          {message.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="msg-att-chip"
                            >
                              📎 {att.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {isLastInGroup && (
                      <div className="msg-meta">
                        <span className="msg-time">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isSeller && message.isRead && (
                          <span className="msg-read-status"> • Đã xem</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isPartnerTyping && (
              <div className="msg-row msg-received">
                <div className="msg-row-avatar-col">
                  <img src={studentAvatar} alt="" className="msg-chat-avatar" />
                </div>
                <div className="msg-content-col">
                  <div className="msg-bubble msg-typing-bubble">
                    <div className="msg-typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="msg-scroll-anchor" />
          </div>
        )}
      </div>

      {/* --- FOOTER (INPUT) --- */}
      <div className="msg-footer-area">
        {!isConnected && (
          <div className="msg-offline-alert">⚠️ Mất kết nối máy chủ</div>
        )}

        <form onSubmit={handleSendMessage} className="msg-input-form">
          <div className="msg-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Nhập tin nhắn..."
              disabled={sending}
              className="msg-main-input"
            />
          </div>

          <button
            type="submit"
            className="msg-action-btn msg-send-btn"
            disabled={!inputMessage.trim()}
          >
            {sending ? "..." : "➤"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagePanel;
