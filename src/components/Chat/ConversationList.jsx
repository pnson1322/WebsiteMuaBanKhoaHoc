import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useUnreadCount } from '../../contexts/UnreadCountContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ConversationItem from './ConversationItem';
import { chatAPI } from '../../services/chatAPI';
import { blockAPI } from '../../services/blockAPI';
import './ConversationList.css';

const ConversationList = () => {
    const {
        conversations,
        activeConversation,
        selectConversation,
        loading,
        unreadConversationCount,
        loadMoreConversations,
        hasMore,
        // 🔥 THÊM: Lấy hàm set state từ Context để cập nhật giao diện ngay lập tức
        setConversations,
        setActiveConversation
    } = useChat();

    const { refreshUnreadCount } = useUnreadCount();
    const { showSuccess, showError } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // 🔥 SỬA: Thêm trạng thái isBlocked vào context menu để biết nên hiện nút "Chặn" hay "Gỡ chặn"
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        conversationId: null,
        targetUserId: null,
        isBlocked: false // Lưu trạng thái hiện tại
    });

    const listRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Helper: Format thời gian
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

    // Map dữ liệu hội thoại
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
            // 🔥 Giữ nguyên logic visual, không thêm class mờ/ẩn
            raw: conv // conv gốc đã chứa isBlock
        }));
    }, [conversations, formatTime]);

    // --- LOGIC CẬP NHẬT TRẠNG THÁI BLOCK (QUAN TRỌNG) ---
    const updateBlockStatusLocally = (targetUserId, newStatus) => {
        // 1. Cập nhật danh sách bên trái (để lần sau click chuột phải nó hiện đúng menu)
        if (setConversations) {
            setConversations(prev => prev.map(conv => {
                if (conv.buyerId === targetUserId) {
                    return { ...conv, isBlock: newStatus };
                }
                return conv;
            }));
        }

        // 2. Cập nhật MessagePanel ngay lập tức (để khóa/mở khóa input)
        // Kiểm tra nếu đang chat đúng với người đó
        if (activeConversation && activeConversation.buyerId === targetUserId && setActiveConversation) {
            setActiveConversation(prev => ({ ...prev, isBlock: newStatus }));
        }
    };

    const handleBlockUser = async () => {
        const { targetUserId } = contextMenu;
        if (!targetUserId) return showError('Không xác định được người dùng.');
        if (!window.confirm("Chặn người dùng này?")) return;

        try {
            await blockAPI.blockUser(targetUserId);

            // 🔥 Cập nhật state ngay lập tức
            updateBlockStatusLocally(targetUserId, true);

            showSuccess('Đã chặn thành công!');
            setContextMenu({ ...contextMenu, visible: false });
        } catch (error) {
            showError('Lỗi khi chặn người dùng.');
        }
    };

    const handleUnblockUser = async () => {
        const { targetUserId } = contextMenu;
        if (!targetUserId) return showError('Không xác định được người dùng.');
        if (!window.confirm("Gỡ chặn người dùng này?")) return;

        try {
            await blockAPI.unblockUser(targetUserId);

            // 🔥 Cập nhật state ngay lập tức
            updateBlockStatusLocally(targetUserId, false);

            showSuccess('Đã gỡ chặn thành công!');
            setContextMenu({ ...contextMenu, visible: false });
        } catch (error) {
            showError('Lỗi khi gỡ chặn.');
        }
    };

    // --- CÁC HÀM KHÁC GIỮ NGUYÊN ---

    const handleSearchResultClick = (item) => {
        const activeId = item.id || item.conversationId;
        const existingRawConv = conversations.find(c => c.id === activeId);

        if (existingRawConv) {
            selectConversation(existingRawConv);
        } else {
            const newRawConv = {
                ...item,
                id: activeId,
                buyerName: item.buyerName || item.studentName,
                buyerAvatar: item.buyerAvatar || item.studentAvatar,
            };
            selectConversation(newRawConv);
        }
        setSearchQuery('');
        setSearchResults([]);
        setTimeout(() => refreshUnreadCount(), 500);
    };

    // 🔥 SỬA: Lấy trạng thái block hiện tại khi click chuột phải
    const handleContextMenu = (e, conversationId, targetUserId, currentIsBlock) => {
        e.preventDefault();

        // 1. Kích thước menu (khớp với CSS width: 180px)
        const menuWidth = 180;
        const menuHeight = 110; // Ước lượng chiều cao (2 dòng + padding)

        // 2. Lấy kích thước màn hình hiển thị
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // 3. Lấy tọa độ chuột (clientX/Y chuẩn hơn pageX/Y khi dùng position: fixed)
        let x = e.clientX;
        let y = e.clientY;

        // --- LOGIC CHỐNG TRÀN ---

        // Nếu menu bị tràn bên phải -> Dịch sang bên trái chuột
        if (x + menuWidth > screenW) {
            x = x - menuWidth;
        }

        // Nếu menu bị tràn bên dưới -> Dịch lên trên chuột
        if (y + menuHeight > screenH) {
            y = y - menuHeight;
        }

        setContextMenu({
            visible: true,
            x: x,
            y: y,
            conversationId: conversationId,
            targetUserId: targetUserId,
            isBlocked: currentIsBlock
        });
    };

    const handleDeleteConversation = async () => {
        const { conversationId } = contextMenu;
        if (!conversationId) return;
        if (!window.confirm("Ẩn cuộc trò chuyện này?")) return;
        try {
            await chatAPI.deleteConversation(conversationId);
            if (activeConversation?.id === conversationId) selectConversation(null);

            // Xóa khỏi list local để đỡ reload
            if (setConversations) {
                setConversations(prev => prev.filter(c => c.id !== conversationId));
            }

            showSuccess("Đã ẩn cuộc trò chuyện!");
        } catch (error) {
            showError("Lỗi khi ẩn cuộc trò chuyện.");
        }
    };

    // Search logic giữ nguyên
    const handleSearchFetch = async (query) => {
        setIsSearching(true);
        try {
            const data = await chatAPI.searchBuyers(query);
            setSearchResults(data);
        } catch (error) {
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

    const handleScroll = () => {
        if (listRef.current && !searchQuery) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading && hasMore) {
                loadMoreConversations();
            }
        }
    };

    const handleSelectFromItem = useCallback((rawConv) => {
        if (rawConv) {
            selectConversation(rawConv);
            setTimeout(() => refreshUnreadCount(), 1000);
        }
    }, [selectConversation, refreshUnreadCount]);

    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

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
                            <div className="empty-search-chat">Không tìm thấy kết quả.</div>
                        ) : (
                            searchResults.map(item => (
                                <div
                                    key={item.id || item.conversationId}
                                    className="conversation-item search-result-item-chat"
                                    onClick={() => handleSearchResultClick(item)}
                                    // Context menu cho search result
                                    onContextMenu={(e) => handleContextMenu(e, item.id || item.conversationId, item.buyerId, item.isBlock)}
                                >
                                    {/* Render nội dung search result (giữ nguyên code cũ của bạn) */}
                                    <div className="avatar-wrapper">
                                        <img src={item.buyerAvatar || `https://ui-avatars.com/api/?name=${item.buyerName}&background=random`} alt="avt" />
                                    </div>
                                    <div className="conversation-info">
                                        <div className="top-row">
                                            <span className="student-name">{item.buyerName}</span>
                                        </div>
                                        <div className="bottom-row">
                                            {/* 🔥 SỬA: Hiển thị tên khóa học thay vì text cứng */}
                                            <span className="msg-course-title" >
                                                {/* Ưu tiên hiển thị Course Title, nếu không có mới hiện text mặc định */}
                                                {item.courseTitle || item.courseName || 'Nhấn để chat'}
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
                            </div>
                        ) : (
                            mappedConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    // 🔥 TRUYỀN conversation.raw.isBlock vào hàm xử lý chuột phải
                                    onContextMenu={(e) => handleContextMenu(e, conversation.id, conversation.raw.buyerId, conversation.raw.isBlock)}
                                >
                                    <ConversationItem
                                        conversation={conversation}
                                        isActive={activeConversation?.id?.toString() === conversation.id?.toString()}
                                        onSelect={handleSelectFromItem}
                                    />
                                </div>
                            ))
                        )}
                        {loading && conversations.length > 0 && (
                            <div className="loading-more"><div className="spinner-small"></div></div>
                        )}
                    </>
                )}
            </div>

            {/* CONTEXT MENU */}
            {contextMenu.visible && (
                <div className="custom-context-menu-chat" style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}>
                    <div className="context-menu-item-chat delete-chat" onClick={handleDeleteConversation}>🗑️ Ẩn hội thoại</div>
                    <div className="menu-divider"></div>

                    {/* 🔥 Logic hiển thị nút Block/Unblock dựa trên trạng thái đã lưu */}
                    {contextMenu.isBlocked ? (
                        <div className="context-menu-item-chat unblock-chat" style={{ color: '#28a745' }} onClick={handleUnblockUser}>
                            🔓 Gỡ chặn
                        </div>
                    ) : (
                        <div className="context-menu-item-chat block-chat" style={{ color: '#d9534f' }} onClick={handleBlockUser}>
                            🚫 Chặn người này
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConversationList;