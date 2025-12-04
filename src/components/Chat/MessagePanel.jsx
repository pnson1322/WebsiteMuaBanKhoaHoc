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
        isConnected
    } = useChat();

    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null); // ✅ Thêm ref cho input

    // Auto scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ✅ Auto focus input khi mở conversation
    useEffect(() => {
        if (activeConversation) {
            inputRef.current?.focus();
        }
    }, [activeConversation]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && attachments.length === 0) return;

        try {
            setSending(true);
            await sendMessage(activeConversation.id, inputMessage, attachments);
            setInputMessage('');
            setAttachments([]);

            // ✅ Focus lại input sau khi gửi thành công
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

            // ✅ Focus lại input sau khi upload file
            inputRef.current?.focus();
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Không thể tải file lên. Vui lòng thử lại!');
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        // ✅ Focus lại input sau khi xóa attachment
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
    const studentAvatar =
        activeConversation.buyerAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.buyerName)}&background=random&color=fff`;

    const courseName = activeConversation.courseTitle || '';
    const sellerId = activeConversation.sellerId;

    return (
        <div className="message-panel-content">
            {/* Header */}
            <div className="message-panel-header">
                <div className="chat-user-info">
                    <img
                        src={studentAvatar}
                        alt={studentName}
                        className="chat-avatar"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.buyerName)}&background=random&color=fff`;
                        }}
                    />
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
                            const showAvatar = index === 0 ||
                                messages[index - 1].senderId !== message.senderId;

                            return (
                                <div
                                    key={message.id}
                                    className={`message-item ${isSeller ? 'sent' : 'received'}`}
                                >
                                    {/* SỬA LẠI LOGIC HIỂN THỊ AVATAR */}
                                    {!isSeller && (
                                        showAvatar ? (
                                            <img
                                                src={studentAvatar}
                                                alt=""
                                                className="message-avatar"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.buyerName)}&background=random&color=fff`;
                                                }}
                                            />
                                        ) : (
                                            // Render một div rỗng có class giống hệt để giữ chỗ
                                            <div className="message-avatar placeholder"></div>
                                        )
                                    )}

                                    <div className="message-bubble">
                                        <div className="message-content">
                                            {message.content}
                                        </div>

                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="message-attachments">
                                                {message.attachments.map((att, idx) => (
                                                    <div key={idx} className="attachment-item">
                                                        {att.type === 'image' ? (
                                                            <img src={att.url} alt="" />
                                                        ) : (
                                                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                                                                📎 {att.name}
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="message-time">
                                            {formatMessageTime(message.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="message-input-container">
                {!isConnected && (
                    <div className="connection-warning">
                        ⚠️ Mất kết nối. Đang thử kết nối lại...
                    </div>
                )}

                {attachments.length > 0 && (
                    <div className="attachments-preview">
                        {attachments.map((att, index) => (
                            <div key={index} className="attachment-preview">
                                <span>{att.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(index)}
                                    className="remove-attachment"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="message-input-form">

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx"
                    />

                    <input
                        ref={inputRef} // ✅ Gắn ref vào input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        disabled={sending || !isConnected}
                        className="message-input"
                    />

                    <button
                        type="submit"
                        className="send-button"
                        disabled={sending || !isConnected || (!inputMessage.trim() && attachments.length === 0)}
                    >
                        {sending ? '⏳' : '📤'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessagePanel;