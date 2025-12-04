// src/contexts/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../services/chatAPI';

const ChatContext = createContext();

export const ChatProvider = ({ children, sellerId, authToken }) => {
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadConversationCount, setUnreadConversationCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState({}); // ✅ {userId: true/false}
    const [onlineUsers, setOnlineUsers] = useState({});

    const activeConversationRef = useRef(activeConversation);
    const connectionRef = useRef(connection);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

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

    // ✅ Hàm đếm lại unread count
    const recalculateUnreadCounts = useCallback((conversationsArray) => {
        const totalUnread = conversationsArray.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        const unreadConvCount = conversationsArray.filter(conv => (conv.unreadCount || 0) > 0).length;

        setUnreadCount(totalUnread);
        setUnreadConversationCount(unreadConvCount);

        console.log('📊 Unread stats - Total:', totalUnread, 'Conversations:', unreadConvCount);
    }, []);

    // ✅ Hàm đánh dấu đã đọc qua SignalR
    const markConversationAsRead = useCallback(async (conversationId) => {
        if (!conversationId) return;

        // 1. Cập nhật UI ngay lập tức
        setConversations(prev => {
            const updatedConvs = prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            );
            recalculateUnreadCounts(updatedConvs);
            return updatedConvs;
        });

        // 2. Gọi SignalR
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke('MarkAsRead', conversationId);
                console.log(`✅ Marked conversation ${conversationId} as read`);
            } catch (err) {
                console.error('❌ Error invoking MarkAsRead:', err);
            }
        }
    }, [recalculateUnreadCounts]);

    // ✅ Hàm gửi typing status
    const sendTyping = useCallback(async (conversationId, isTyping) => {
        if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        try {
            await connectionRef.current.invoke('UserTyping', conversationId, isTyping);
            console.log(`⌨️ Sent typing status: ${isTyping}`);
        } catch (err) {
            console.error('Error sending typing status:', err);
        }
    }, []);

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations(sellerId);
            const conversationsArray = response.items || [];
            console.log('📦 Conversations loaded:', conversationsArray.length);

            setConversations(conversationsArray);
            recalculateUnreadCounts(conversationsArray);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [sellerId, recalculateUnreadCounts]);

    // ✅ Load messages - SỬA LẠI ĐỂ TRÁNH CIRCULAR DEPENDENCY
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

            // 3. ✅ Đánh dấu đã đọc TRỰC TIẾP (không gọi hàm markConversationAsRead)
            // Cập nhật UI
            setConversations(prev => {
                const updatedConvs = prev.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                );
                recalculateUnreadCounts(updatedConvs);
                return updatedConvs;
            });

            // Gọi SignalR
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                try {
                    await connectionRef.current.invoke('MarkAsRead', conversationId);
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
    }, [recalculateUnreadCounts]); // ✅ Chỉ depend vào recalculateUnreadCounts

    // ✅ Hàm cập nhật conversation khi có tin nhắn mới
    const updateConversationWithNewMessage = useCallback((message) => {
        setConversations(prev => {
            const updatedConvs = prev.map(conv =>
                conv.id === message.conversationId
                    ? {
                        ...conv,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount: activeConversationRef.current?.id === message.conversationId
                            ? conv.unreadCount
                            : (conv.unreadCount || 0) + 1
                    }
                    : conv
            );

            const targetConv = updatedConvs.find(c => c.id === message.conversationId);
            if (!targetConv) return updatedConvs;

            const others = updatedConvs.filter(c => c.id !== message.conversationId);
            const reordered = [targetConv, ...others];

            recalculateUnreadCounts(reordered);
            return reordered;
        });
    }, [recalculateUnreadCounts]);

    // ✅ Xử lý message mới
    const handleNewMessage = useCallback((message) => {
        console.log('📩 New message received:', message);

        const isChatOpen = activeConversationRef.current?.id === message.conversationId;

        if (isChatOpen) {
            // Thêm tin nhắn
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });

            // ✅ Đánh dấu đã đọc ngay
            markConversationAsRead(message.conversationId);
        }

        // Cập nhật conversation list
        updateConversationWithNewMessage(message);
    }, [updateConversationWithNewMessage, markConversationAsRead]);

    // ✅ Xử lý notification
    const handleNewMessageNotification = useCallback((data) => {
        console.log('🔔 New message notification:', data);

        const message = data.message || data.Message;

        if (!message) {
            console.error('❌ Message is undefined in notification data:', data);
            return;
        }

        if (activeConversationRef.current?.id === message.conversationId) {
            console.log('ℹ️ Already in this conversation, skipping notification');
            return;
        }

        updateConversationWithNewMessage(message);
    }, [updateConversationWithNewMessage]);

    // Gửi message
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

            console.log('📤 Sending message via SignalR:', dto);
            await connectionRef.current.invoke('SendMessage', dto);
            console.log('✅ Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    // Connection events
    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            try {
                await connection.start();
                console.log('✅ ChatHub Connected');
                setIsConnected(true);
                await loadConversations();
            } catch (error) {
                console.error('❌ ChatHub Connection Error:', error);
                setIsConnected(false);
            }
        };

        // Đăng ký events
        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('NewMessageNotification', handleNewMessageNotification);

        connection.on('UserJoined', (userId, connectionId) => {
            console.log(`👤 User ${userId} joined`);
            setOnlineUsers(prev => ({ ...prev, [userId]: true }));
        });

        connection.on('UserLeft', (userId, connectionId) => {
            console.log(`👋 User ${userId} left`);
            setOnlineUsers(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
        });

        // ✅ Xử lý typing status
        connection.on('UserTypingStatus', (userId, isTyping) => {
            console.log(`⌨️ User ${userId} typing: ${isTyping}`);

            if (activeConversationRef.current) {
                setTypingUsers(prev => {
                    if (isTyping) {
                        return { ...prev, [userId]: true };
                    } else {
                        const newState = { ...prev };
                        delete newState[userId];
                        return newState;
                    }
                });

                // ✅ Auto clear sau 3s nếu không có update
                setTimeout(() => {
                    setTypingUsers(prev => {
                        const newState = { ...prev };
                        delete newState[userId];
                        return newState;
                    });
                }, 3000);
            }
        });

        // ✅ Xử lý đã đọc
        connection.on('MessagesMarkedAsRead', (userId, conversationId) => {
            console.log(`👁️ User ${userId} read conversation ${conversationId}`);

            if (activeConversationRef.current?.id === conversationId) {
                setMessages(prev => prev.map(msg => ({
                    ...msg,
                    isRead: true
                })));
            }
        });

        connection.onreconnecting(() => {
            console.log('🔄 ChatHub reconnecting...');
            setIsConnected(false);
        });

        connection.onreconnected(async () => {
            console.log('✅ ChatHub reconnected');
            setIsConnected(true);

            if (activeConversationRef.current) {
                try {
                    await connection.invoke('JoinConversation', activeConversationRef.current.id);
                    console.log(`✅ Rejoined conversation: ${activeConversationRef.current.id}`);
                } catch (err) {
                    console.error('Error rejoining conversation:', err);
                }
            }

            await loadConversations();
        });

        connection.onclose(() => {
            console.log('❌ ChatHub connection closed');
            setIsConnected(false);
        });

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

    // Leave conversation khi unmount
    useEffect(() => {
        return () => {
            if (activeConversation && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                connectionRef.current.invoke('LeaveConversation', activeConversation.id)
                    .catch(err => console.error('Error leaving conversation:', err));
            }
        };
    }, [activeConversation]);

    // ✅ Select conversation
    const selectConversation = useCallback(async (conversation) => {
        // Leave conversation cũ
        if (activeConversationRef.current && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke('LeaveConversation', activeConversationRef.current.id);
                console.log(`👋 Left conversation: ${activeConversationRef.current.id}`);
            } catch (err) {
                console.error('Error leaving conversation:', err);
            }
        }

        // Reset typing users
        setTypingUsers({});

        // Set active và load messages
        setActiveConversation(conversation);
        await loadMessages(conversation.id);
    }, [loadMessages]);

    // Filter by course
    const filterByCourse = useCallback(async (courseId) => {
        try {
            setLoading(true);
            if (courseId) {
                const response = await chatAPI.getConversationsByCourse(courseId);
                const conversationsArray = response.items || [];
                setConversations(conversationsArray);
                recalculateUnreadCounts(conversationsArray);
            } else {
                await loadConversations();
            }
        } catch (error) {
            console.error('Error filtering conversations:', error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [loadConversations, recalculateUnreadCounts]);

    const value = {
        isConnected,
        conversations,
        activeConversation,
        messages,
        unreadCount,
        unreadConversationCount,
        loading,
        onlineUsers,
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