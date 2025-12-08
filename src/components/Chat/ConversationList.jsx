import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useUnreadCount } from '../../contexts/UnreadCountContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ConversationItem from './ConversationItem';
import { chatAPI } from '../../services/chatAPI'; // Đảm bảo đường dẫn đúng tới file chatAPI.js
import './ConversationList.css';

const ConversationList = () => {
    // 1. Lấy dữ liệu từ Context
    const {
        conversations,
        activeConversation,
        selectConversation,
        loading,
        unreadConversationCount,
        loadMoreConversations,
        hasMore
    } = useChat();

    const { refreshUnreadCount } = useUnreadCount();

    // 2. State quản lý tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]); // Array chứa các ConversationDto tìm được
    const [isSearching, setIsSearching] = useState(false);

    // 3. Refs
    const listRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // 4. Helper: Format thời gian
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

    // 5. Map dữ liệu hội thoại chính (List mặc định)
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
            raw: conv
        }));
    }, [conversations, formatTime]);

    // 6. LOGIC TÌM KIẾM (Search Fetch)
    const handleSearchFetch = async (query) => {
        setIsSearching(true);
        try {
            // Gọi API searchBuyers (Backend trả về List<ChatUserSearchResultDto>)
            // Dữ liệu trả về gồm: conversationId, buyerName, courseTitle...
            const data = await chatAPI.searchBuyers(query);
            setSearchResults(data);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // 7. Debounce Input
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            if (value.trim()) {
                handleSearchFetch(value);
            } else {
                setSearchResults([]);
            }
        }, 500); // Đợi 500ms sau khi ngừng gõ
    };

    // 8. Xử lý CLICK vào KẾT QUẢ TÌM KIẾM
    const handleSearchResultClick = (item) => {
        // item: { conversationId, buyerId, buyerName, buyerAvatar, courseTitle, lastMessageAt }

        // Map dữ liệu từ kết quả tìm kiếm sang cấu trúc mà Context/ChatWindow hiểu
        const conversationToOpen = {
            id: item.conversationId,       // Quan trọng nhất
            buyerId: item.buyerId,
            buyerName: item.buyerName,
            buyerAvatar: item.buyerAvatar,
            courseTitle: item.courseTitle, // Để hiển thị tên khóa học trên header chat
            // Các trường khác map nếu cần
        };

        // Mở chat
        selectConversation(conversationToOpen);

        // Reset search để quay lại giao diện chat
        setSearchQuery('');
        setSearchResults([]);
    };

    // 9. Xử lý Scroll (Chỉ chạy khi không search)
    const handleScroll = () => {
        if (listRef.current && !searchQuery) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading && hasMore) {
                loadMoreConversations();
            }
        }
    };

    // 10. Xử lý chọn hội thoại trong List Cũ
    const handleSelectOld = useCallback((rawConv) => {
        if (rawConv) {
            selectConversation(rawConv);
            // Cập nhật lại số tin nhắn chưa đọc sau 1s
            setTimeout(() => {
                refreshUnreadCount();
            }, 1000);
        }
    }, [selectConversation, refreshUnreadCount]);

    return (
        <div className="chat-panel conversation-panel">
            {/* --- HEADER --- */}
            <div className="panel-header">
                <h2 className="header-title">
                    Tin nhắn {unreadConversationCount > 0 && <span className="main-badge">{unreadConversationCount}</span>}
                </h2>
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên học viên..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {isSearching && <div className="spinner-mini"></div>}
                </div>
            </div>

            {/* --- BODY --- */}
            <div className="conversation-items scrollable-content" ref={listRef} onScroll={handleScroll}>

                {searchQuery ? (
                    // === TRƯỜNG HỢP 1: ĐANG TÌM KIẾM ===
                    <div className="search-results-list-chat">
                        <h4 className="search-label-chat">Kết quả tìm kiếm</h4>

                        {searchResults.length === 0 && !isSearching ? (
                            <div className="empty-search-chat">Không tìm thấy cuộc trò chuyện nào.</div>
                        ) : (
                            searchResults.map(item => (
                                <div
                                    key={item.conversationId}
                                    className="conversation-item search-result-item-chat"
                                    onClick={() => handleSearchResultClick(item)}
                                >
                                    <div className="avatar-wrapper">
                                        <img src={item.buyerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            item.buyerName
                                        )}&background=random&color=fff`} alt="avt" />
                                    </div>
                                    <div className="conversation-info">
                                        <div className="top-row">
                                            <span className="student-name">{item.buyerName}</span>
                                            {item.lastMessageAt && (
                                                <span className="time">{formatTime(item.lastMessageAt)}</span>
                                            )}
                                        </div>
                                        <div className="bottom-row">
                                            {/* Hiển thị tên khóa học để Seller dễ phân biệt */}
                                            <span className="last-message" style={{ color: '#007bff', fontSize: '0.85rem' }}>
                                                Khóa học: {item.courseTitle}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // === TRƯỜNG HỢP 2: DANH SÁCH MẶC ĐỊNH ===
                    <>
                        {mappedConversations.length === 0 && !loading ? (
                            <div className="empty-state">
                                <div className="empty-img">📭</div>
                                <h3>Chưa có tin nhắn</h3>
                                <p>Hộp thư hiện đang trống.</p>
                            </div>
                        ) : (
                            mappedConversations.map((conversation) => (
                                <ConversationItem
                                    key={conversation.id}
                                    conversation={conversation}
                                    isActive={activeConversation?.id?.toString() === conversation.id?.toString()}
                                    onSelect={handleSelectOld}
                                />
                            ))
                        )}

                        {/* Spinner loading more khi scroll */}
                        {loading && conversations.length > 0 && (
                            <div className="loading-more">
                                <div className="spinner-small"></div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ConversationList;