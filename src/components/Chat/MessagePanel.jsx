import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "./MessagePanel.css";

const MessagePanel = () => {
  const {
    activeConversation,
    messages,
    sendMessage,
    loading, // Loading ban đầu (toàn màn hình)
    isConnected,
    typingUsers,
    onlineUsers,
    sendTyping,

    // ✅ 1. IMPORT CÁC HÀM PHÂN TRANG
    loadOldMessages,
    hasMoreMessages,
    isMessageLoading, // Loading khi tải tin cũ
  } = useChat();

  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ 2. THÊM REF ĐỂ TÍNH TOÁN CUỘN
  const listContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(null);

  // --- LOGIC CUỘN XUỐNG ĐÁY (SCROLL TO BOTTOM) ---
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // Chỉ cuộn xuống đáy khi: Mới vào chat HOẶC Có người gõ HOẶC Gửi tin mới
  // ⚠️ QUAN TRỌNG: Không cuộn khi đang load tin cũ (isMessageLoading)
  useEffect(() => {
    if (!isMessageLoading) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation, typingUsers]); // Bỏ 'messages' ra khỏi đây để tránh xung đột

  // ✅ ĐOẠN CODE MỚI: CHỈ CUỘN KHI TIN CUỐI CÙNG THAY ĐỔI
  const lastMessageIdRef = useRef(null); // Thêm ref này để lưu ID tin cuối cùng

  useEffect(() => {
    if (messages.length === 0) return;

    // Lấy tin nhắn cuối cùng hiện tại
    const lastMessage = messages[messages.length - 1];
    const prevLastMessageId = lastMessageIdRef.current;

    // Cập nhật ref để dùng cho lần sau
    lastMessageIdRef.current = lastMessage.id;

    // LOGIC QUYẾT ĐỊNH CUỘN:
    // 1. Nếu chưa có prevId (lần đầu load) -> Cuộn.
    // 2. Nếu ID tin cuối khác ID tin cuối trước đó -> Có tin mới ở đáy -> Cuộn.
    // 3. (Trường hợp load tin cũ: ID tin cuối KHÔNG đổi -> Không làm gì cả).
    if (!prevLastMessageId || lastMessage.id !== prevLastMessageId) {
      scrollToBottom();
    }

  }, [messages]); // Dependency là messages


  // --- LOGIC LOAD TIN CŨ & GIỮ VỊ TRÍ (SCROLL RESTORATION) ---

  // Sự kiện cuộn
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.target;

    // Nếu cuộn lên đỉnh (0px) và còn tin cũ và không đang load
    if (scrollTop === 0 && hasMoreMessages && !isMessageLoading) {
      // Lưu chiều cao hiện tại trước khi load thêm
      prevScrollHeightRef.current = scrollHeight;
      // Gọi API tải thêm
      loadOldMessages();
    }
  };

  // Dùng useLayoutEffect để chỉnh lại thanh cuộn NGAY SAU khi DOM cập nhật
  useLayoutEffect(() => {
    // Nếu vừa load xong tin cũ (isMessageLoading chuyển từ true -> false)
    // Và có lưu chiều cao cũ
    if (!isMessageLoading && prevScrollHeightRef.current && listContainerRef.current) {
      const newScrollHeight = listContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;

      // Đẩy thanh cuộn xuống một đoạn đúng bằng chiều cao đống tin nhắn mới thêm vào
      listContainerRef.current.scrollTop = heightDifference;

      // Reset
      prevScrollHeightRef.current = null;
    }
  }, [messages, isMessageLoading]);


  // --- LOGIC INPUT & GUI TIN (GIỮ NGUYÊN) ---
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
      typingTimeoutRef.current = setTimeout(() => sendTyping(activeConversation.id, false), 1500);
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
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: vi });
    } catch { return ""; }
  };

  if (!activeConversation) {
    return (
      <div className="msg-panel-empty">
        <div className="msg-empty-content">
          <div className="msg-empty-icon" style={{ opacity: "1" }}>📭</div>
          <h2>Chào mừng trở lại!</h2>
          <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
        </div>
      </div>
    );
  }

  const studentName = activeConversation.buyerName || "Người dùng";
  const studentAvatar = activeConversation.buyerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&color=fff`;
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
            <img src={studentAvatar} alt={studentName} className="msg-header-avatar" />
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
      {/* ✅ 3. GẮN REF CONTAINER VÀ SỰ KIỆN SCROLL */}
      <div
        className="msg-list-container scrollable-content"
        ref={listContainerRef}
        onScroll={handleScroll}
      >
        {/* ✅ 4. HIỂN THỊ LOADING NHỎ KHI KÉO LÊN TRÊN */}
        {isMessageLoading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '12px' }}>
            ⏳ Đang tải tin nhắn cũ...
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="msg-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="msg-list-wrapper">
            {messages.map((message, index) => {
              const isSeller = message.senderId === sellerId;
              const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;
              const showAvatar = !isSeller && isLastInGroup;

              return (
                <div key={message.id} className={`msg-row ${isSeller ? "msg-sent" : "msg-received"}`}>
                  <div className="msg-row-avatar-col">
                    {!isSeller && showAvatar && (
                      <img src={studentAvatar} alt="" className="msg-chat-avatar" />
                    )}
                  </div>
                  <div className="msg-content-col">
                    <div className="msg-bubble">
                      {message.content && <div className="msg-text">{message.content}</div>}
                      {message.attachments?.length > 0 && (
                        <div className="msg-attachments-grid">
                          {message.attachments.map((att, idx) => (
                            <a key={idx} href={att.url} target="_blank" rel="noreferrer" className="msg-att-chip">
                              📎 {att.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {isLastInGroup && (
                      <div className="msg-meta">
                        <span className="msg-time">{formatMessageTime(message.createdAt)}</span>
                        {isSeller && message.isRead && <span className="msg-read-status"> • Đã xem</span>}
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
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Scroll Anchor */}
            <div ref={messagesEndRef} className="msg-scroll-anchor" />
          </div>
        )}
      </div>

      {/* --- FOOTER (INPUT) --- */}
      <div className="msg-footer-area">
        {!isConnected && <div className="msg-offline-alert">⚠️ Mất kết nối máy chủ</div>}
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
          <button type="submit" className="msg-action-btn msg-send-btn" disabled={!inputMessage.trim()}>
            {sending ? "..." : "➤"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagePanel;