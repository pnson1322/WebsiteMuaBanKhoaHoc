// src/components/chat/MessagePanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { chatAPI } from '../../services/chatAPI';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './MessagePanel.css';

const MessagePanel = () => {
    const {
        activeConversation,
        messages,
        sendMessage,
        loading,
        isConnected,
        // ✅ 1. Lấy thêm props từ Context
        typingUsers,
        onlineUsers,
        sendTyping
    } = useChat();

    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState([]);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    // ✅ Ref dùng để debounce việc gửi status typing
    const typingTimeoutRef = useRef(null);

    // Auto scroll xuống cuối khi có tin nhắn mới HOẶC khi đối phương đang gõ
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    useEffect(() => {
        if (activeConversation) {
            inputRef.current?.focus();
        }
    }, [activeConversation]);

    // ✅ Hàm xử lý khi user gõ phím
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputMessage(value);

        if (!activeConversation) return;

        // Nếu có text -> Gửi signal typing = true
        if (value.trim().length > 0) {
            // Xóa timeout cũ (nếu user vẫn đang gõ liên tục)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Gửi signal "Đang gõ" (có thể optimize bằng cách check flag để không gửi liên tục mỗi ký tự)
            // Tuy nhiên SignalR handle việc này khá nhẹ, gửi mỗi lần gõ cũng ok để duy trì session
            sendTyping(activeConversation.id, true);

            // Set timeout: Sau 2 giây không gõ gì thêm -> Gửi signal "Ngừng gõ"
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(activeConversation.id, false);
            }, 1000);
        } else {
            // Nếu xóa hết text -> Gửi signal ngừng gõ ngay
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            sendTyping(activeConversation.id, false);
        }
    };

    // ✅ Hàm xử lý khi user blur khỏi input (click ra ngoài)
    const handleInputBlur = () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (activeConversation) {
            sendTyping(activeConversation.id, false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && attachments.length === 0) return;

        // Xóa timeout typing khi gửi
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        try {
            setSending(true);
            await sendMessage(activeConversation.id, inputMessage, attachments);

            setInputMessage('');
            setAttachments([]);

            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const uploadPromises = files.map(file => chatAPI.uploadFile(file));
            const uploadedFiles = await Promise.all(uploadPromises);
            setAttachments(prev => [...prev, ...uploadedFiles]);
            inputRef.current?.focus();
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Không thể tải file lên. Vui lòng thử lại!');
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        inputRef.current?.focus();
    };

    const formatMessageTime = (dateString) => {
        try {
            return format(new Date(dateString), 'HH:mm, dd/MM/yyyy', { locale: vi });
        } catch {
            return '';
        }
    };

    if (!activeConversation) {
        return (
            <div className="message-panel-empty">
                <div className="empty-state-large">
                    <div className="empty-icon">💬</div>
                    <h2>Chọn một cuộc trò chuyện</h2>
                    <p>Chọn một tin nhắn từ danh sách bên trái để bắt đầu trò chuyện</p>
                </div>
            </div>
        );
    }

    const studentName = activeConversation.buyerName || 'Người dùng';
    const studentAvatar = activeConversation.buyerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&color=fff`;
    const courseName = activeConversation.courseTitle || '';
    const sellerId = activeConversation.sellerId;

    // ✅ Xác định ID của người đối diện (để check xem họ có đang gõ không)
    // Giả sử context này dùng cho Seller, thì người đối diện là BuyerId
    // Nếu activeConversation có trường buyerId, dùng nó:
    const partnerId = activeConversation.buyerId;

    // Kiểm tra xem người đối diện có đang gõ không
    const isPartnerTyping = typingUsers && typingUsers[partnerId];
    const isOnline = onlineUsers[partnerId];

    return (
        <div className="message-panel-content">
            {/*Header */}
            <div className="message-panel-header">
                <div className="chat-user-info">
                    {/* ✅ Bọc Avatar trong div relative để đặt chấm xanh */}
                    <div className="avatar-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={studentAvatar} alt={studentName} className="chat-avatar" />

                        {/* Chấm xanh trạng thái */}
                        {isOnline && (
                            <span
                                className="online-dot"
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#22c55e', // Màu xanh lá
                                    borderRadius: '50%',
                                    border: '2px solid white'
                                }}
                            />
                        )}
                    </div>

                    <div className="chat-user-details">
                        <h3>{studentName}</h3>
                    </div>
                </div>

                {courseName && (
                    <div className="active-course-info">
                        <span className="course-label">Khóa học:</span>
                        <span className="course-name">{courseName}</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="messages-container">
                {loading && messages.length === 0 ? (
                    <div className="messages-loading">
                        <div className="spinner"></div>
                        <p>Đang tải tin nhắn...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="messages-empty">
                        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map((message, index) => {
                            const isSeller = message.senderId === sellerId;
                            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                            return (
                                <div key={message.id} className={`message-item ${isSeller ? 'sent' : 'received'}`}>
                                    {!isSeller && (
                                        showAvatar ?
                                            <img src={studentAvatar} alt="" className="message-avatar" /> :
                                            <div className="message-avatar placeholder"></div>
                                    )}
                                    <div className="message-bubble">
                                        <div className="message-content">{message.content}</div>
                                        {message.attachments?.length > 0 && (
                                            <div className="message-attachments">
                                                {message.attachments.map((att, idx) => (
                                                    <div key={idx} className="attachment-item">
                                                        <a href={att.url} target="_blank" rel="noreferrer">📎 {att.name}</a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="message-time">{formatMessageTime(message.createdAt)}</div>

                                        {/* Status: Đã xem / Đã gửi */}
                                        {isSeller && (
                                            <div className={`message-status ${message.isRead ? 'read' : ''}`}>
                                                {message.isRead ? 'Đã xem' : 'Đã gửi'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bong bóng typing indicator */}
                        {isPartnerTyping && (
                            <div className="message-item received typing-indicator-container">
                                <img src={studentAvatar} alt="" className="message-avatar" />
                                <div className="message-bubble typing-bubble">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="message-input-container">
                {!isConnected && <div className="connection-warning">⚠️ Mất kết nối...</div>}

                {attachments.length > 0 && (
                    <div className="attachments-preview">
                        {attachments.map((att, index) => (
                            <div key={index} className="attachment-preview">
                                <span>{att.name}</span>
                                <button type="button" onClick={() => removeAttachment(index)}>×</button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="message-input-form">
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileSelect} />

                    <button type="button" className="attach-button" onClick={() => fileInputRef.current?.click()}>
                        📎
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="Nhập tin nhắn..."
                        disabled={sending || !isConnected}
                        className="message-input"
                    />

                    <button type="submit" className="send-button" disabled={sending || !isConnected || (!inputMessage.trim() && attachments.length === 0)}>
                        {sending ? '⏳' : '📤'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MessagePanel;