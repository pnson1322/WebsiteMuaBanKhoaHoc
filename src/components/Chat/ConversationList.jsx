import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
// Import Context đếm số (Logic từ Code A)
import { useUnreadCount } from '../../contexts/UnreadCountContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ConversationItem from './ConversationItem'; // Component con (Logic từ Code B)
import './ConversationList.css';

const ConversationList = () => {
    // 1. Lấy dữ liệu từ ChatContext (Bao gồm cả logic phân trang từ Code A)
    const {
        conversations,
        activeConversation,
        selectConversation,
        loading,
        unreadConversationCount, // Lấy tên biến từ Code A cho chính xác
        loadMoreConversations,
        hasMore
    } = useChat();

    // 2. Lấy hàm refresh header (Logic từ Code A)
    const { refreshUnreadCount } = useUnreadCount();

    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef(null); // Ref để xử lý scroll (Code A)

    // 3. Format thời gian (Tối ưu bằng useCallback)
    const formatTime = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: vi
            });
        } catch {
            return '';
        }
    }, []);

    // 4. Map dữ liệu (Tối ưu bằng useMemo)
    const mappedConversations = useMemo(() => {
        const safeConversations = Array.isArray(conversations) ? conversations : [];

        return safeConversations.map((conv) => ({
            id: conv.id,
            studentName: conv.buyerName || 'Người dùng',
            studentAvatar: conv.buyerAvatar || '',
            courseName: conv.courseTitle || '',
            lastMessage: conv.lastMessage?.content || 'Chưa có tin nhắn',
            lastMessageTime: conv.lastMessage?.createdAt || conv.lastMessageAt,
            formattedTime: formatTime(conv.lastMessage?.createdAt || conv.lastMessageAt),
            unreadCount: conv.unreadCount || 0,
            isOnline: false,
            raw: conv // Giữ lại object gốc để xử lý click
        }));
    }, [conversations, formatTime]);

    // 5. Lọc tìm kiếm
    const filteredConversations = useMemo(() => {
        return mappedConversations.filter((conv) =>
            conv.studentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mappedConversations, searchQuery]);

    // 6. Xử lý Scroll để phân trang (Logic quan trọng từ Code A)
    const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            // Nếu cuộn gần xuống đáy (còn 5px) và chưa loading + còn dữ liệu
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading && hasMore) {
                loadMoreConversations();
            }
        }
    };

    // 7. Xử lý chọn hội thoại (Logic update Header từ Code A + Logic select từ Code B)
    const handleSelect = useCallback((rawConv) => {
        if (rawConv) {
            // A. Gọi hàm của ChatContext để load tin nhắn
            selectConversation(rawConv);

            // B. Hack setTimeout để cập nhật lại số trên Header sau khi API đánh dấu đã đọc chạy xong
            setTimeout(() => {
                refreshUnreadCount();
                console.log("🔄 Đã yêu cầu Header cập nhật lại số lượng!");
            }, 1000);
        }
    }, [selectConversation, refreshUnreadCount]);

    return (
        <div className="chat-panel conversation-panel">
            {/* Header: Class name theo Code B */}
            <div className="panel-header">
                <h2 className="header-title">
                    Tin nhắn
                    {unreadConversationCount > 0 && (
                        <span className="main-badge">{unreadConversationCount}</span>
                    )}
                </h2>
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm học viên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List Items: Class name Code B nhưng thêm ref và onScroll của Code A */}
            <div
                className="conversation-items scrollable-content"
                ref={listRef}
                onScroll={handleScroll}
            >
                {loading && mappedConversations.length === 0 ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải tin nhắn...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-img">📭</div>
                        <h3>Chưa có tin nhắn</h3>
                        <p>Hộp thư của bạn hiện đang trống hoặc không tìm thấy kết quả.</p>
                    </div>
                ) : (
                    // Render danh sách sử dụng ConversationItem
                    filteredConversations.map((conversation) => (
                        <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={
                                activeConversation?.id?.toString() === conversation.id?.toString()
                            }
                            onSelect={handleSelect} // Truyền hàm handleSelect đã gộp logic
                        />
                    ))
                )}

                {/* Phần hiển thị loading khi cuộn xuống dưới (Logic Code A) */}
                {loading && conversations.length > 0 && (
                    <div className="loading-more">
                        <div className="spinner-small"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;