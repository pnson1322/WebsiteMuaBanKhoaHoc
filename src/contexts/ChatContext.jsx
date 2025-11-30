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

    // ✅ Hàm đếm lại unread count (tách riêng để tái sử dụng)
    const recalculateUnreadCounts = useCallback((conversationsArray) => {
        const totalUnread = conversationsArray.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        const unreadConvCount = conversationsArray.filter(conv => (conv.unreadCount || 0) > 0).length;

        setUnreadCount(totalUnread);
        setUnreadConversationCount(unreadConvCount);

        console.log('📊 Unread stats - Total:', totalUnread, 'Conversations:', unreadConvCount);
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

    // Load messages
    const loadMessages = useCallback(async (conversationId) => {
        try {
            setLoading(true);
            const response = await chatAPI.getMessages(conversationId);
            const messagesArray = response.items || (Array.isArray(response) ? response : []);
            console.log('💬 Messages loaded:', messagesArray.length);

            setMessages(messagesArray);

            // Join vào conversation room
            if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
                try {
                    await connectionRef.current.invoke('JoinConversation', conversationId);
                    console.log(`✅ Joined conversation room: ${conversationId}`);
                } catch (err) {
                    console.error('Error joining conversation:', err);
                }
            }

            // Đánh dấu đã đọc
            await chatAPI.markAsRead(conversationId);

            // ✅ Cập nhật unreadCount = 0 và đếm lại
            setConversations(prev => {
                const updatedConvs = prev.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                );
                recalculateUnreadCounts(updatedConvs);
                return updatedConvs;
            });
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [recalculateUnreadCounts]);

    // ✅ Hàm chung để cập nhật conversation khi có tin nhắn mới
    const updateConversationWithNewMessage = useCallback((message) => {
        setConversations(prev => {
            // Cập nhật lastMessage và unreadCount
            const updatedConvs = prev.map(conv =>
                conv.id === message.conversationId
                    ? {
                        ...conv,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        // ✅ Chỉ tăng unread nếu KHÔNG đang xem conversation này
                        unreadCount: activeConversationRef.current?.id === message.conversationId
                            ? conv.unreadCount // Giữ nguyên (đã được reset khi loadMessages)
                            : (conv.unreadCount || 0) + 1
                    }
                    : conv
            );

            // Chuyển conversation lên đầu
            const targetConv = updatedConvs.find(c => c.id === message.conversationId);
            if (!targetConv) return updatedConvs;

            const others = updatedConvs.filter(c => c.id !== message.conversationId);
            const reordered = [targetConv, ...others];

            // Đếm lại unread counts
            recalculateUnreadCounts(reordered);

            return reordered;
        });
    }, [recalculateUnreadCounts]);

    // ✅ Xử lý message mới từ ReceiveMessage event
    const handleNewMessage = useCallback((message) => {
        console.log('📩 New message received via SignalR:', message);

        // Thêm vào danh sách messages nếu đang xem conversation này
        if (activeConversationRef.current?.id === message.conversationId) {
            setMessages(prev => {
                const isDuplicate = prev.some(m => m.id === message.id);
                if (isDuplicate) {
                    console.log('⚠️ Duplicate message detected, skipping');
                    return prev;
                }
                return [...prev, message];
            });
        }

        // Cập nhật conversation list
        updateConversationWithNewMessage(message);
    }, [updateConversationWithNewMessage]);

    // ✅ Xử lý notification (dùng chung hàm update)
    const handleNewMessageNotification = useCallback((data) => {
        console.log('🔔 New message notification:', data);

        // ✅ SỬA: Backend gửi chữ thường
        const message = data.message || data.Message;

        if (!message) {
            console.error('❌ Message is undefined in notification data:', data);
            return;
        }

        // Nếu đang xem conversation này thì không cần xử lý
        // (tin nhắn đã được thêm qua ReceiveMessage)
        if (activeConversationRef.current?.id === message.conversationId) {
            console.log('ℹ️ Already in this conversation, skipping notification');
            return;
        }

        updateConversationWithNewMessage(message);
    }, [updateConversationWithNewMessage]);

    // Gửi message qua SignalR
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

        // Đăng ký event handlers
        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('NewMessageNotification', handleNewMessageNotification);

        connection.on('UserJoined', (userId, connectionId) => {
            console.log(`👤 User ${userId} joined (${connectionId})`);
        });

        connection.on('UserLeft', (userId, connectionId) => {
            console.log(`👋 User ${userId} left (${connectionId})`);
        });

        connection.on('UserTypingStatus', (userId, isTyping) => {
            console.log(`⌨️ User ${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
        });

        connection.on('MessagesMarkedAsRead', (userId, conversationId) => {
            console.log(`✅ Messages marked as read by user ${userId}`);
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

    // Leave conversation khi component unmount
    useEffect(() => {
        return () => {
            if (activeConversation && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                connectionRef.current.invoke('LeaveConversation', activeConversation.id)
                    .catch(err => console.error('Error leaving conversation:', err));
            }
        };
    }, [activeConversation]);

    // ✅ Select conversation với reset unread ngay lập tức
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

        // ✅ Reset unread ngay lập tức để UI responsive
        setConversations(prev => {
            const updatedConvs = prev.map(conv =>
                conv.id === conversation.id
                    ? { ...conv, unreadCount: 0 }
                    : conv
            );
            recalculateUnreadCounts(updatedConvs);
            return updatedConvs;
        });

        // Set active và load messages
        setActiveConversation(conversation);
        await loadMessages(conversation.id);
    }, [loadMessages, recalculateUnreadCounts]);

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
        loadConversations,
        selectConversation,
        sendMessage,
        filterByCourse,
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