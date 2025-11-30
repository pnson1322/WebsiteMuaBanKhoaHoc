// src/components/chat/ConversationList.jsx
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import './ConversationList.css';

const ConversationList = () => {
    const {
        conversations,
        activeConversation,
        selectConversation,
        loading,
        unreadCount
    } = useChat();

    const [searchQuery, setSearchQuery] = useState('');

    // ✅ Thêm check an toàn
    const safeConversations = Array.isArray(conversations) ? conversations : [];

    // Map lại dữ liệu API để phù hợp UI
    const mappedConversations = safeConversations.map(conv => ({
        id: conv.id,
        studentName: conv.buyerName || 'Người dùng',
        studentAvatar: conv.buyerAvatar || '',
        courseName: conv.courseTitle || '',
        lastMessage: conv.lastMessage?.content || 'Chưa có tin nhắn',
        lastMessageTime: conv.lastMessage?.createdAt || conv.lastMessageAt,
        unreadCount: conv.unreadCount || 0,
        isOnline: false,
        raw: conv
    }));

    // Search
    const filteredConversations = mappedConversations.filter(conv =>
        conv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Format thời gian
    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: vi
            });
        } catch {
            return '';
        }
    };

    return (
        <div className="conversation-list">
            <div className="conversation-list-header">
                <h2>
                    Tin nhắn
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </h2>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm tin nhắn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="conversation-items">
                {loading && mappedConversations.length === 0 ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải tin nhắn...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <p>Chưa có tin nhắn nào</p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''
                                } ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                            onClick={() => selectConversation(conversation.raw)}
                        >
                            <div className="conversation-avatar">
                                <img
                                    src={conversation.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.studentName)}&background=random&color=fff`}
                                    alt={conversation.studentName}
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.studentName)}&background=random&color=fff`;
                                    }}
                                />
                                {conversation.isOnline && (
                                    <span className="online-indicator"></span>
                                )}
                            </div>

                            <div className="conversation-content">
                                <div className="conversation-header">
                                    <h3 className="conversation-name">
                                        {conversation.studentName}
                                    </h3>
                                    <span className="conversation-time">
                                        {formatTime(conversation.lastMessageTime)}
                                    </span>
                                </div>

                                <div className="conversation-footer">
                                    <p className="conversation-last-message">
                                        {conversation.lastMessage}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                        <span className="message-badge">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>

                                {conversation.courseName && (
                                    <div className="conversation-course">
                                        <span className="course-tag">
                                            📚 {conversation.courseName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConversationList;
