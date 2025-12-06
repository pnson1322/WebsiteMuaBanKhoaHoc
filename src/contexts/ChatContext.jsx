// src/contexts/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../services/chatAPI';

// 1. ✅ IMPORT HOOK CỦA CONTEXT ĐẾM SỐ
import { useUnreadCount } from './UnreadCountContext';

const ChatContext = createContext();

export const ChatProvider = ({ children, sellerId, authToken }) => {
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    // 2. ✅ LẤY DATA VÀ HÀM TỪ UNREAD CONTEXT
    // Bỏ state unreadConversationCount cục bộ đi
    const { unreadCount, refreshUnreadCount } = useUnreadCount();

    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeCourseFilter, setActiveCourseFilter] = useState(null);

    const activeConversationRef = useRef(activeConversation);
    const connectionRef = useRef(connection);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    // (Đã xóa hàm fetchUnreadTotal vì dùng refreshUnreadCount của context kia)

    // Kết nối ChatHub
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

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [sellerId, authToken]);

    // ✅ ĐÃ SỬA: Dùng refreshUnreadCount thay vì fetchUnreadTotal
    const markConversationAsRead = useCallback(async (conversationId) => {
        if (!conversationId) return;

        // 1. Cập nhật UI List ngay lập tức
        setConversations(prev => {
            return prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            );
        });

        // 2. Gọi SignalR & Refresh Context kia
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke('MarkAsRead', conversationId);

                // ✅ Gọi context ngoài để cập nhật số tổng
                refreshUnreadCount();
            } catch (err) {
                console.error('❌ Error invoking MarkAsRead:', err);
            }
        }
    }, [refreshUnreadCount]); // Dependency là hàm từ context ngoài

    // Hàm gửi typing status
    const sendTyping = useCallback(async (conversationId, isTyping) => {
        if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) return;
        try {
            await connectionRef.current.invoke('UserTyping', conversationId, isTyping);
        } catch (err) {
            console.error('Error sending typing status:', err);
        }
    }, []);

    // Load conversations
    const fetchConversationsList = useCallback(async (pageNum, courseIdOverride = undefined) => {
        setLoading(true);
        try {
            const pageSize = 10;
            const currentCourseId = courseIdOverride !== undefined ? courseIdOverride : activeCourseFilter;

            let response;
            if (currentCourseId) {
                response = await chatAPI.getConversationsByCourse(currentCourseId, pageNum, pageSize);
            } else {
                response = await chatAPI.getConversations(sellerId, pageNum, pageSize);
            }

            const newItems = response.items || [];
            const totalCount = response.totalCount || 0;

            setConversations(prev => {
                if (pageNum === 1) return newItems;
                const existingIds = new Set(prev.map(c => c.id));
                const uniqueNewItems = newItems.filter(c => !existingIds.has(c.id));
                return [...prev, ...uniqueNewItems];
            });

            setPage(pageNum);
            setHasMore(newItems.length === pageSize && (pageNum * pageSize) < totalCount);

        } catch (error) {
            console.error('Error fetching conversations:', error);
            if (pageNum === 1) setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [sellerId, activeCourseFilter]);

    // ✅ ĐÃ SỬA: Load conversations -> Refresh Context kia
    const loadConversations = useCallback(() => {
        refreshUnreadCount(); // Đồng bộ số liệu ngay khi load
        return fetchConversationsList(1);
    }, [fetchConversationsList, refreshUnreadCount]);

    const loadMoreConversations = useCallback(() => {
        if (!loading && hasMore) {
            fetchConversationsList(page + 1);
        }
    }, [loading, hasMore, page, fetchConversationsList]);

    // ✅ ĐÃ SỬA: Load messages -> Refresh Context kia
    const loadMessages = useCallback(async (conversationId) => {
        try {
            setLoading(true);

            // 1. Lấy tin nhắn
            const response = await chatAPI.getMessages(conversationId);
            const messagesArray = response.items || (Array.isArray(response) ? response : []);
            setMessages(messagesArray);

            // 2. Join room
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                await connectionRef.current.invoke('JoinConversation', conversationId);
            }

            // 3. Update UI Local
            setConversations(prev => {
                return prev.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                );
            });

            // 4. SignalR & Refresh Global Count
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                try {
                    await connectionRef.current.invoke('MarkAsRead', conversationId);
                    refreshUnreadCount(); // ✅ Cập nhật số tổng
                } catch (err) {
                    console.error('Error marking as read:', err);
                }
            }

        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [refreshUnreadCount]);

    const updateConversationWithNewMessage = useCallback((message, newConversationData = null) => {
        setConversations(prev => {
            const existingConvIndex = prev.findIndex(c => c.id === message.conversationId);

            if (existingConvIndex !== -1) {
                const updatedList = [...prev];
                const existingConv = updatedList[existingConvIndex];

                const isCurrentChat = activeConversationRef.current?.id === message.conversationId;
                const newUnreadCount = isCurrentChat ? 0 : (existingConv.unreadCount || 0) + 1;

                updatedList[existingConvIndex] = {
                    ...existingConv,
                    lastMessage: message,
                    lastMessageAt: message.createdAt,
                    unreadCount: newUnreadCount
                };

                const target = updatedList[existingConvIndex];
                updatedList.splice(existingConvIndex, 1);
                updatedList.unshift(target);

                return updatedList;
            } else {
                if (newConversationData) {
                    const newConvFormatted = {
                        ...newConversationData,
                        id: newConversationData.id || newConversationData.Id,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount: 1,
                        buyerName: newConversationData.buyerName || newConversationData.BuyerName,
                        buyerAvatar: newConversationData.buyerAvatar || newConversationData.BuyerAvatar,
                        courseTitle: newConversationData.courseTitle || newConversationData.CourseTitle
                    };
                    return [newConvFormatted, ...prev];
                }
                return prev;
            }
        });
    }, []);

    // ✅ ĐÃ SỬA: Handle New Message -> Refresh Context kia
    const handleNewMessage = useCallback((message) => {
        const isChatOpen = activeConversationRef.current?.id === message.conversationId;

        if (isChatOpen) {
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
            markConversationAsRead(message.conversationId);
        } else {
            // Không mở chat -> Có tin mới -> Gọi hàm refresh để tăng số
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

        // Có noti -> Chắc chắn là tin chưa đọc -> Gọi refresh
        refreshUnreadCount();
    }, [updateConversationWithNewMessage, refreshUnreadCount]);

    const sendMessage = useCallback(async (conversationId, content, attachments = []) => {
        if (!conversationId || !content.trim()) return;
        try {
            if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
                throw new Error('SignalR not connected');
            }
            const dto = {
                ConversationId: conversationId,
                Content: content,
                Attachments: attachments.map(att => ({
                    FileName: att.name,
                    FileUrl: att.url,
                    FileType: att.type
                }))
            };
            await connectionRef.current.invoke('SendMessage', dto);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            try {
                await connection.start();
                setIsConnected(true);
                await loadConversations();
            } catch (error) {
                console.error('❌ ChatHub Connection Error:', error);
                setIsConnected(false);
            }
        };

        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('NewMessageNotification', handleNewMessageNotification);

        connection.on('UserJoined', (userId) => setOnlineUsers(prev => ({ ...prev, [userId]: true })));
        connection.on('UserLeft', (userId) => setOnlineUsers(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
        }));

        connection.on('UserTypingStatus', (userId, isTyping) => {
            if (activeConversationRef.current) {
                setTypingUsers(prev => {
                    if (isTyping) return { ...prev, [userId]: true };
                    const newState = { ...prev };
                    delete newState[userId];
                    return newState;
                });
                if (isTyping) {
                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const newState = { ...prev };
                            delete newState[userId];
                            return newState;
                        });
                    }, 3000);
                }
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
                try {
                    await connection.invoke('JoinConversation', activeConversationRef.current.id);
                } catch (err) { console.error(err); }
            }
            await loadConversations();
        });

        connection.onclose(() => setIsConnected(false));

        startConnection();

        return () => {
            connection.off('ReceiveMessage');
            connection.off('NewMessageNotification');
            connection.off('UserJoined');
            connection.off('UserLeft');
            connection.off('UserTypingStatus');
            connection.off('MessagesMarkedAsRead');
        };
    }, [connection, handleNewMessage, handleNewMessageNotification, loadConversations]);

    useEffect(() => {
        return () => {
            if (activeConversation && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                connectionRef.current.invoke('LeaveConversation', activeConversation.id).catch(console.error);
            }
        };
    }, [activeConversation]);

    const selectConversation = useCallback(async (conversation) => {
        if (activeConversationRef.current && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke('LeaveConversation', activeConversationRef.current.id);
            } catch (err) { console.error(err); }
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

    const value = {
        isConnected,
        conversations,
        activeConversation,
        messages,

        // 3. ✅ TRẢ VỀ GIÁ TRỊ TỪ UNREAD CONTEXT (Đổi tên cho khớp với code cũ)
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
        markConversationAsRead
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};