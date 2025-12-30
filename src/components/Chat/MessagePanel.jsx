import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useToast } from '../../contexts/ToastContext';
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
    loadOldMessages,
    hasMoreMessages,
    isMessageLoading,
  } = useChat();

  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useToast();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const listContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  // --- 1. XỬ LÝ TRẠNG THÁI BLOCK ---
  // Lấy giá trị isBlock trực tiếp từ activeConversation (khớp với JSON bạn cung cấp)
  const isBlocked = activeConversation?.isBlock === true;

  // --- LOGIC SCROLL (Giữ nguyên) ---
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (!isMessageLoading) scrollToBottom();
  }, [activeConversation, typingUsers]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const prevLastMessageId = lastMessageIdRef.current;
    lastMessageIdRef.current = lastMessage.id;
    if (!prevLastMessageId || lastMessage.id !== prevLastMessageId) {
      scrollToBottom();
    }
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.target;
    if (scrollTop === 0 && hasMoreMessages && !isMessageLoading) {
      prevScrollHeightRef.current = scrollHeight;
      loadOldMessages();
    }
  };

  useLayoutEffect(() => {
    if (!isMessageLoading && prevScrollHeightRef.current && listContainerRef.current) {
      const newScrollHeight = listContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      listContainerRef.current.scrollTop = heightDifference;
      prevScrollHeightRef.current = null;
    }
  }, [messages, isMessageLoading]);

  // --- LOGIC INPUT & TYPING ---

  useEffect(() => {
    // Chỉ focus vào ô nhập liệu nếu kết nối tốt và KHÔNG bị chặn
    if (activeConversation && !isBlocked && isConnected) {
      // Dùng timeout nhỏ để đảm bảo UI đã render xong
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeConversation, isBlocked, isConnected]);

  const handleInputChange = (e) => {
    // Chặn ngay lập tức nếu đang block
    if (isBlocked) return;

    const value = e.target.value;
    setInputMessage(value);

    if (!activeConversation) return;

    // Logic Typing Indicator
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

    // Guard Clause: Kiểm tra chặn hoặc input rỗng
    if (isBlocked || !inputMessage.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      setSending(true);
      await sendMessage(activeConversation.id, inputMessage, []);
      setInputMessage("");

      // Focus lại sau khi gửi xong
      setTimeout(() => inputRef.current?.focus(), 0);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      showError("Gửi tin nhắn thất bại.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: vi });
    } catch { return ""; }
  };

  // --- RENDER ---

  if (!activeConversation) {
    return (
      <div className="msg-panel-empty">
        <div className="msg-empty-content">
          <div className="msg-empty-icon">📭</div>
          <h2>Chào mừng trở lại!</h2>
          <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
        </div>
      </div>
    );
  }

  // Mapping dữ liệu từ activeConversation (dựa trên JSON mẫu)
  const studentName = activeConversation.buyerName || "Người dùng";
  const studentAvatar = activeConversation.buyerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&color=fff`;
  const courseName = activeConversation.courseTitle || "";

  // Xác định ID người bán và người mua hiện tại trong context hội thoại
  const sellerId = activeConversation.sellerId;
  const partnerId = activeConversation.buyerId; // Đối tác chat (người mua)

  // Kiểm tra trạng thái online/typing của đối tác
  const isPartnerTyping = typingUsers && typingUsers[partnerId];
  const isOnline = onlineUsers && onlineUsers[partnerId];

  return (
    <div className="msg-panel-container">
      {/* HEADER */}
      <div className="msg-panel-header">
        <div className="msg-header-left">
          <div className="msg-avatar-group">
            <img src={studentAvatar} alt={studentName} className="msg-header-avatar" />
            {isOnline && <span className="msg-status-dot online" />}
          </div>
          <div className="msg-user-info">
            <h3 className="msg-user-name">{studentName}</h3>

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

      {/* MESSAGE LIST */}
      <div className="msg-list-container scrollable-content" ref={listContainerRef} onScroll={handleScroll}>
        {isMessageLoading && (
          <div className="msg-loading-history">⏳ Đang tải tin nhắn cũ...</div>
        )}

        {loading && messages.length === 0 ? (
          <div className="msg-loading"><div className="spinner"></div></div>
        ) : (
          <div className="msg-list-wrapper">
            {messages.map((message, index) => {
              // Logic xác định tin nhắn của Seller (mình) hay Buyer (họ)
              // Lưu ý: Cần đảm bảo senderId trong message khớp với sellerId hoặc buyerId
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

            {/* Chỉ hiện Typing khi KHÔNG bị chặn */}
            {isPartnerTyping && !isBlocked && (
              <div className="msg-row msg-received">
                <div className="msg-row-avatar-col">
                  <img src={studentAvatar} alt="" className="msg-chat-avatar" />
                </div>
                <div className="msg-content-col">
                  <div className="msg-bubble msg-typing-bubble">
                    <div className="msg-typing-dots"><span></span><span></span><span></span></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="msg-scroll-anchor" />
          </div>
        )}
      </div>

      {/* FOOTER AREA - XỬ LÝ GIAO DIỆN BLOCK */}
      <div className="msg-footer-area">
        {!isConnected && <div className="msg-offline-alert">⚠️ Mất kết nối máy chủ</div>}

        {isBlocked ? (
          // --- GIAO DIỆN KHI BỊ BLOCK ---
          <div className="msg-blocked-alert">
            <span className="block-icon">🚫</span>
            <div className="block-text">
              <strong>Cuộc trò chuyện này đã bị chặn</strong>
              <span>Bạn không thể gửi tin nhắn cho người dùng này.</span>
            </div>
          </div>
        ) : (
          // --- GIAO DIỆN NHẬP TIN NHẮN BÌNH THƯỜNG ---
          <form onSubmit={handleSendMessage} className="msg-input-form">
            <div className="msg-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Nhập tin nhắn..."
                disabled={sending || !isConnected}
                className="msg-main-input"
              />
            </div>
            <button
              type="submit"
              className="msg-action-btn msg-send-btn"
              disabled={!inputMessage.trim() || sending || !isConnected}
            >
              {sending ? "..." : "➤"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MessagePanel;