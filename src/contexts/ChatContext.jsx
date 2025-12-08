import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../services/chatAPI';

// Import hook đếm số (giữ nguyên của bạn)
import { useUnreadCount } from './UnreadCountContext';

const ChatContext = createContext();

export const ChatProvider = ({ children, sellerId, authToken }) => {
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    // --- STATE PHÂN TRANG ---
    const [messagePage, setMessagePage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isMessageLoading, setIsMessageLoading] = useState(false); // Loading khi kéo lên trên
    // -------------------------

    const { unreadCount, refreshUnreadCount } = useUnreadCount();

    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});

    // Pagination cho Conversation list
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeCourseFilter, setActiveCourseFilter] = useState(null);

    const activeConversationRef = useRef(activeConversation);
    const connectionRef = useRef(connection);

    // Cập nhật ref
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    // 1. KHỞI TẠO SIGNALR OBJECT
    useEffect(() => {
        if (!sellerId || !authToken) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5230';

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/chatHub`, {
                accessTokenFactory: () => authToken,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);

        // Cleanup: Stop connection khi component unmount hoặc token đổi
        return () => {
            if (newConnection) {
                newConnection.stop().catch(err => console.error("Error stopping connection:", err));
            }
        };
    }, [sellerId, authToken]);

    // 2. MARK AS READ
    const markConversationAsRead = useCallback(async (conversationId) => {
        if (!conversationId) return;

        setConversations(prev => prev.map(conv =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));

        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke('MarkAsRead', conversationId);
                refreshUnreadCount();
            } catch (err) {
                console.error('❌ Error invoking MarkAsRead:', err);
            }
        }
    }, [refreshUnreadCount]);


    // 1. LOAD MESSAGES (Trang 1 - Khi mới mở hội thoại)
    // --------------------------------------------------------
    const loadMessages = useCallback(async (conversationId) => {
        try {
            setLoading(true); // Loading UI

            // Reset lại trạng thái phân trang
            setMessagePage(1);
            setHasMoreMessages(true);

            // Gọi API trang 1
            const pageSize = 20; // Bạn có thể chỉnh số này (ví dụ 10, 20)
            const response = await chatAPI.getMessages(conversationId, 1, pageSize);

            // ✅ LẤY DỮ LIỆU TỪ STRUCTURE MỚI
            const messagesArray = response.items || [];
            const totalCount = response.totalCount || 0;

            // Set tin nhắn vào state
            setMessages(messagesArray);

            // ✅ TÍNH TOÁN HAS MORE CHÍNH XÁC
            // Nếu tổng số tin đã lấy (trang 1 * pageSize) nhỏ hơn tổng số tin trong DB -> Còn tin cũ
            // Hoặc đơn giản: Nếu số tin lấy về < totalCount -> Còn tin
            setHasMoreMessages(messagesArray.length < totalCount);

            // Join Room SignalR & Mark Read (Giữ nguyên logic cũ)
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                await connectionRef.current.invoke('JoinConversation', conversationId);
                await connectionRef.current.invoke('MarkAsRead', conversationId);
                refreshUnreadCount();
            }

            // Update UI đã đọc ở list bên trái
            setConversations(prev => prev.map(conv =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ));

        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [refreshUnreadCount]);

    // --------------------------------------------------------
    // 2. LOAD OLD MESSAGES (Trang 2, 3... - Khi cuộn lên trên)
    // --------------------------------------------------------
    const loadOldMessages = useCallback(async () => {
        // Kiểm tra an toàn
        if (!activeConversationRef.current || !hasMoreMessages || isMessageLoading) return;

        try {
            setIsMessageLoading(true); // Bật loading nhỏ
            const nextPage = messagePage + 1;
            const pageSize = 20; // Phải khớp với pageSize ở trên
            const currentId = activeConversationRef.current.id;

            console.log(`📥 Loading page ${nextPage} for conv ${currentId}`);

            const response = await chatAPI.getMessages(currentId, nextPage, pageSize);

            // ✅ LẤY DỮ LIỆU
            const oldMessages = response.items || [];
            const totalCount = response.totalCount || 0;

            if (oldMessages.length > 0) {
                // Nối tin cũ vào ĐẦU danh sách (Prepend)
                // Dùng Set để lọc trùng tin nhắn (đề phòng mạng lag request 2 lần)
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueOldMessages = oldMessages.filter(m => !existingIds.has(m.id));
                    return [...uniqueOldMessages, ...prev];
                });

                // Cập nhật trang hiện tại
                setMessagePage(nextPage);

                // ✅ LOGIC CHECK HẾT TIN
                // Nếu tổng số tin ước tính đã lấy >= totalCount thì dừng
                const totalLoadedEstimate = nextPage * pageSize;
                setHasMoreMessages(totalLoadedEstimate < totalCount);
            } else {
                // API trả về rỗng -> Chắc chắn hết tin
                setHasMoreMessages(false);
            }

        } catch (error) {
            console.error('Error loading older messages:', error);
            setHasMoreMessages(false); // Gặp lỗi thì tạm thời coi như hết để tránh gọi lại liên tục
        } finally {
            setIsMessageLoading(false);
        }
    }, [messagePage, hasMoreMessages, isMessageLoading]);

    // Các hàm phụ trợ (Typing, SendMessage...)
    const sendTyping = useCallback(async (conversationId, isTyping) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try { await connectionRef.current.invoke('UserTyping', conversationId, isTyping); }
            catch (err) { console.error(err); }
        }
    }, []);

    const sendMessage = useCallback(async (conversationId, content, attachments = []) => {
        if (!conversationId || !content.trim()) return;
        try {
            if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
                throw new Error('SignalR not connected');
            }
            const dto = {
                ConversationId: conversationId,
                Content: content,
                Attachments: attachments.map(att => ({ FileName: att.name, FileUrl: att.url, FileType: att.type }))
            };
            await connectionRef.current.invoke('SendMessage', dto);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    // Helper update conversation list khi có tin mới
    const updateConversationWithNewMessage = useCallback((message, newConversationData = null) => {
        setConversations(prev => {
            // 1. Tìm cuộc hội thoại trong danh sách hiện tại
            const existingConvIndex = prev.findIndex(c => c.id === message.conversationId);

            // --- TRƯỜNG HỢP: ĐÃ CÓ TRONG DANH SÁCH ---
            if (existingConvIndex !== -1) {
                const updatedList = [...prev];
                const existingConv = updatedList[existingConvIndex];

                // Logic tính số tin chưa đọc
                const isCurrentChat = activeConversationRef.current?.id === message.conversationId;
                const newUnreadCount = isCurrentChat ? 0 : (existingConv.unreadCount || 0) + 1;

                // Tạo object mới với thông tin cập nhật
                const updatedConversation = {
                    ...existingConv,
                    lastMessage: message,
                    lastMessageAt: message.createdAt,
                    unreadCount: newUnreadCount
                };

                // ✅ FIX LỖI BIẾN MẤT: Xóa phần tử cũ và thêm phần tử ĐÃ LƯU vào đầu
                updatedList.splice(existingConvIndex, 1);
                updatedList.unshift(updatedConversation);

                return updatedList;
            }

            // --- TRƯỜNG HỢP: CHƯA CÓ (HỘI THOẠI MỚI) ---
            else {
                if (newConversationData) {
                    // ✅ FIX LỖI FILTER: Kiểm tra xem hội thoại mới có thuộc Course đang lọc không?
                    // Nếu đang lọc theo Course A, mà tin nhắn đến từ Course B -> Không thêm vào list
                    if (activeCourseFilter && newConversationData.courseId !== activeCourseFilter) {
                        return prev;
                    }

                    const newConvFormatted = {
                        ...newConversationData,
                        id: newConversationData.id || newConversationData.Id,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount: 1,
                        // ... map các trường khác nếu cần
                    };
                    return [newConvFormatted, ...prev];
                }
                return prev;
            }
        });
    }, [activeCourseFilter]); // ⚠️ QUAN TRỌNG: Thêm activeCourseFilter vào dependency

    // Handle Receive Message
    const handleNewMessage = useCallback((message) => {
        const isChatOpen = activeConversationRef.current?.id === message.conversationId;
        if (isChatOpen) {
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
            markConversationAsRead(message.conversationId);
        } else {
            refreshUnreadCount();
        }
        updateConversationWithNewMessage(message, null);
    }, [updateConversationWithNewMessage, markConversationAsRead, refreshUnreadCount]);

    const handleNewMessageNotification = useCallback((data) => {
        const message = data.message || data.Message;
        const conversation = data.conversation || data.Conversation;
        if (!message) return;
        if (activeConversationRef.current?.id === message.conversationId) return;

        updateConversationWithNewMessage(message, conversation);
        refreshUnreadCount();
    }, [updateConversationWithNewMessage, refreshUnreadCount]);

    const fetchConversationsList = useCallback(async (pageNum, courseIdOverride = undefined) => {
        // (Giữ nguyên logic load list của bạn)
        // Code rút gọn cho đỡ dài:
        setLoading(true);
        try {
            const pageSize = 10;
            const currentCourseId = courseIdOverride !== undefined ? courseIdOverride : activeCourseFilter;
            let response;
            if (currentCourseId) response = await chatAPI.getConversationsByCourse(currentCourseId, pageNum, pageSize);
            else response = await chatAPI.getConversations(sellerId, pageNum, pageSize);

            const newItems = response.items || [];
            const totalCount = response.totalCount || 0;
            setConversations(prev => pageNum === 1 ? newItems : [...prev, ...newItems]); // Cần lọc trùng nếu cần
            setPage(pageNum);
            setHasMore(newItems.length === pageSize && (pageNum * pageSize) < totalCount);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [sellerId, activeCourseFilter]);

    const loadConversations = useCallback(() => {
        refreshUnreadCount();
        return fetchConversationsList(1);
    }, [fetchConversationsList, refreshUnreadCount]);

    const loadMoreConversations = useCallback(() => {
        if (!loading && hasMore) fetchConversationsList(page + 1);
    }, [loading, hasMore, page, fetchConversationsList]);

    const selectConversation = useCallback(async (conversation) => {
        // Leave cũ
        if (activeConversationRef.current && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            connectionRef.current.invoke('LeaveConversation', activeConversationRef.current.id).catch(console.error);
        }
        setTypingUsers({});
        setActiveConversation(conversation);
        await loadMessages(conversation.id);
    }, [loadMessages]);

    const filterByCourse = useCallback((courseId) => {
        const newFilter = courseId || null;
        setActiveCourseFilter(newFilter);
        fetchConversationsList(1, newFilter);
    }, [fetchConversationsList]);

    // 5. ✅ START CONNECTION (ĐÃ SỬA LỖI)
    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            // ✅ CHECK STATE TRƯỚC KHI START
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    await connection.start();
                    console.log("✅ SignalR Connected");
                    setIsConnected(true);
                    await loadConversations();
                } catch (error) {
                    console.error('❌ ChatHub Connection Error:', error);
                    setIsConnected(false);
                }
            }
        };

        // Đăng ký sự kiện
        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('NewMessageNotification', handleNewMessageNotification);
        connection.on('UserJoined', (userId) => setOnlineUsers(prev => ({ ...prev, [userId]: true })));
        connection.on('UserLeft', (userId) => setOnlineUsers(prev => {
            const ns = { ...prev }; delete ns[userId]; return ns;
        }));

        // Typing logic (giữ nguyên)
        connection.on('UserTypingStatus', (userId, isTyping) => {
            if (activeConversationRef.current) {
                setTypingUsers(prev => {
                    if (isTyping) return { ...prev, [userId]: true };
                    const ns = { ...prev }; delete ns[userId]; return ns;
                });
                if (isTyping) setTimeout(() => setTypingUsers(prev => { const ns = { ...prev }; delete ns[userId]; return ns; }), 3000);
            }
        });

        connection.on('MessagesMarkedAsRead', (userId, conversationId) => {
            if (activeConversationRef.current?.id === conversationId) {
                setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
            }
        });

        connection.onreconnecting(() => setIsConnected(false));
        connection.onreconnected(async () => {
            setIsConnected(true);
            if (activeConversationRef.current) {
                try { await connection.invoke('JoinConversation', activeConversationRef.current.id); } catch (e) { }
            }
            await loadConversations();
        });
        connection.onclose(() => setIsConnected(false));

        // Start connection
        startConnection();

        // Cleanup events khi connection object thay đổi
        return () => {
            connection.off('ReceiveMessage');
            connection.off('NewMessageNotification');
            connection.off('UserJoined');
            connection.off('UserLeft');
            connection.off('UserTypingStatus');
            connection.off('MessagesMarkedAsRead');
        };
    }, [connection, handleNewMessage, handleNewMessageNotification, loadConversations]);

    const value = {
        isConnected,
        conversations,
        activeConversation,
        messages,
        unreadConversationCount: unreadCount,
        loading,
        onlineUsers,
        activeCourseFilter,
        loadMoreConversations,
        hasMore,
        loadConversations,
        selectConversation,
        sendMessage,
        filterByCourse,
        typingUsers,
        sendTyping,
        markConversationAsRead,

        // EXPORT CÁC GIÁ TRỊ PHÂN TRANG TIN NHẮN
        loadOldMessages,
        hasMoreMessages,
        isMessageLoading
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within ChatProvider');
    return context;
};