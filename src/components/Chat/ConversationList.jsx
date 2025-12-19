import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'; // Thêm useEffect
import { useChat } from '../../contexts/ChatContext';
import { useUnreadCount } from '../../contexts/UnreadCountContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ConversationItem from './ConversationItem';
import { chatAPI } from '../../services/chatAPI';
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
        hasMore,
        // Giả sử Context có hàm này để reload lại list sạch sẽ. 
        // Nếu chưa có, bạn nên thêm vào Context hoặc dùng tạm window.location.reload()
        fetchConversations
    } = useChat();

    const { refreshUnreadCount } = useUnreadCount();

    // 2. State quản lý tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // --- NEW: State quản lý Context Menu (Chuột phải) ---
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        conversationId: null
    });

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

    // 5. Map dữ liệu hội thoại
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

    // --- NEW: Xử lý Click chuột phải ---
    const handleContextMenu = (e, conversationId) => {
        e.preventDefault(); // Chặn menu mặc định của trình duyệt
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            conversationId: conversationId
        });
    };

    // --- NEW: Đóng menu khi click ra ngoài ---
    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    // --- NEW: Xử lý ẩn cuộc trò chuyện ---
    const handleDeleteConversation = async () => {
        const { conversationId } = contextMenu;
        if (!conversationId) return;

        // Xác nhận người dùng
        if (!window.confirm("Bạn có chắc chắn muốn ẩn cuộc trò chuyện này?")) return;

        try {
            // 1. Gọi API ẩn
            await chatAPI.deleteConversation(conversationId);

            // 2. Nếu cuộc trò chuyện đang mở bị ẩn -> Reset active conversation
            if (activeConversation?.id === conversationId) {
                selectConversation(null);
            }

            // 3. Refresh lại dữ liệu
            // Cách tốt nhất: Gọi hàm reload trong Context (nếu có)
            // Cách tạm thời: Reload trang hoặc lọc thủ công (nhưng vì conversations lấy từ Context nên khó lọc ở đây)
            alert("Đã ẩn thành công!");
            window.location.reload(); // Cách đơn giản nhất để đồng bộ lại Context

        } catch (error) {
            console.error("Failed to delete conversation:", error);
            alert("Có lỗi xảy ra khi ẩn cuộc trò chuyện.");
        }
    };


    // 6. LOGIC TÌM KIẾM
    const handleSearchFetch = async (query) => {
        setIsSearching(true);
        try {
            const data = await chatAPI.searchBuyers(query);
            setSearchResults(data);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (value.trim()) handleSearchFetch(value);
            else setSearchResults([]);
        }, 500);
    };

    const handleSearchResultClick = (item) => {
        const conversationToOpen = {
            id: item.conversationId,
            buyerId: item.buyerId,
            buyerName: item.buyerName,
            buyerAvatar: item.buyerAvatar,
            courseTitle: item.courseTitle,
        };
        selectConversation(conversationToOpen);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleScroll = () => {
        if (listRef.current && !searchQuery) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading && hasMore) {
                loadMoreConversations();
            }
        }
    };

    const handleSelectOld = useCallback((rawConv) => {
        if (rawConv) {
            selectConversation(rawConv);
            setTimeout(() => {
                refreshUnreadCount();
            }, 1000);
        }
    }, [selectConversation, refreshUnreadCount]);

    return (
        <div className="chat-panel conversation-panel">
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

            <div className="conversation-items scrollable-content" ref={listRef} onScroll={handleScroll}>
                {searchQuery ? (
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
                                    // Thêm chuột phải cho cả kết quả tìm kiếm nếu muốn
                                    onContextMenu={(e) => handleContextMenu(e, item.conversationId)}
                                >
                                    <div className="avatar-wrapper">
                                        <img src={item.buyerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.buyerName)}&background=random&color=fff`} alt="avt" />
                                    </div>
                                    <div className="conversation-info">
                                        <div className="top-row">
                                            <span className="student-name">{item.buyerName}</span>
                                            {item.lastMessageAt && <span className="time">{formatTime(item.lastMessageAt)}</span>}
                                        </div>
                                        <div className="bottom-row">
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
                    <>
                        {mappedConversations.length === 0 && !loading ? (
                            <div className="empty-state">
                                <div className="empty-img">📭</div>
                                <h3>Chưa có tin nhắn</h3>
                                <p>Hộp thư hiện đang trống.</p>
                            </div>
                        ) : (
                            mappedConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onContextMenu={(e) => handleContextMenu(e, conversation.id)}
                                >
                                    <ConversationItem
                                        conversation={conversation}
                                        isActive={activeConversation?.id?.toString() === conversation.id?.toString()}
                                        onSelect={handleSelectOld}
                                    />
                                </div>
                            ))
                        )}

                        {loading && conversations.length > 0 && (
                            <div className="loading-more">
                                <div className="spinner-small"></div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- NEW: Context Menu UI --- */}
            {contextMenu.visible && (
                <div
                    className="custom-context-menu-chat"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`
                    }}
                >
                    <div
                        className="context-menu-item-chat delete-chat"
                        onClick={handleDeleteConversation}
                    >
                        Ẩn hội thoại
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationList;