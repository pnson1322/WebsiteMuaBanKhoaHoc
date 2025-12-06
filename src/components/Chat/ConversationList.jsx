// src/components/chat/ConversationList.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
// 1. ✅ IMPORT CONTEXT ĐẾM SỐ
import { useUnreadCount } from '../../contexts/UnreadCountContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import './ConversationList.css';

const ConversationList = () => {
    const {
        conversations,
        activeConversation,
        selectConversation,
        loading,
        unreadConversationCount,
        loadMoreConversations,
        hasMore
    } = useChat();

    // 2. ✅ LẤY HÀM REFRESH TỪ CONTEXT
    const { refreshUnreadCount } = useUnreadCount();

    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef(null);

    const safeConversations = Array.isArray(conversations) ? conversations : [];

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

    const filteredConversations = mappedConversations.filter(conv =>
        conv.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading && hasMore) {
                loadMoreConversations();
            }
        }
    };

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

    // 3. ✅ HÀM XỬ LÝ KHI CLICK VÀO CUỘC TRÒ CHUYỆN
    const handleConversationClick = (conversation) => {
        console.log("Đang chọn conversation:", conversation.raw);

        if (conversation.raw) {
            // A. Gọi hàm của ChatContext để load tin nhắn và join room
            selectConversation(conversation.raw);

            // B. Kích hoạt cập nhật lại số trên Header
            // Tại sao cần setTimeout? 
            // Vì selectConversation sẽ gọi API MarkAsRead. Chúng ta cần đợi API đó chạy xong
            // ở Server thì mới gọi refreshUnreadCount để lấy số chính xác (số đã giảm).
            // 500ms - 1000ms là khoảng thời gian an toàn.
            setTimeout(() => {
                refreshUnreadCount();
                console.log("🔄 Đã yêu cầu Header cập nhật lại số lượng!");
            }, 1000);
        } else {
            console.error("Lỗi: Dữ liệu cuộc trò chuyện (raw) bị thiếu!");
        }
    };

    return (
        <div className="conversation-list">
            <div className="conversation-list-header">
                <h2>
                    Tin nhắn
                    {unreadConversationCount > 0 && (
                        <span className="unread-badge">{unreadConversationCount}</span>
                    )}
                </h2>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên học viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="conversation-items"
                ref={listRef}
                onScroll={handleScroll}
                style={{
                    overflowY: 'auto',
                    flex: 1,
                    height: 'calc(100vh - 160px)'
                }}>
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
                            className={`conversation-item ${activeConversation?.id?.toString() === conversation.id?.toString()
                                    ? 'active'
                                    : ''
                                } ${conversation.unreadCount > 0 ? 'unread' : ''}`}

                            // 4. ✅ GỌI HÀM XỬ LÝ MỚI
                            onClick={() => handleConversationClick(conversation)}
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
                {loading && conversations.length > 0 && (
                    <div className="loading-more">Đang tải thêm...</div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;