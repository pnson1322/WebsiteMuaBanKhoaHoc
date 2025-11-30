// src/hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useSignalR } from '../contexts/SignalRContext';

export const useChat = (currentUserId) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { connection, isConnected } = useSignalR();
    const currentConversationRef = useRef(null);

    // Load courses
    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await chatAPI.getSellerCourses();
            setCourses(data);
            if (data.length > 0 && !selectedCourse) {
                setSelectedCourse(data[0]);
            }
        } catch (err) {
            setError(err.message);
            console.error('Load courses error:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedCourse]);

    // Load conversations by course
    const loadConversations = useCallback(async (courseId) => {
        try {
            setLoading(true);
            const data = await chatAPI.getConversationsByCourse(courseId);
            setConversations(data);
            if (data.length > 0 && !selectedConversation) {
                await selectConversation(data[0]);
            }
        } catch (err) {
            setError(err.message);
            console.error('Load conversations error:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedConversation]);

    // Load messages
    const loadMessages = useCallback(async (conversationId) => {
        try {
            setLoading(true);
            const data = await chatAPI.getMessages(conversationId);
            setMessages(data);

            // Mark as read
            await chatAPI.markAsRead(conversationId);

            // Update unread count in conversation list
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                )
            );
        } catch (err) {
            setError(err.message);
            console.error('Load messages error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Select conversation
    const selectConversation = useCallback(async (conv) => {
        // Leave previous conversation
        if (currentConversationRef.current && connection && isConnected) {
            try {
                await connection.invoke('LeaveConversation', currentConversationRef.current);
            } catch (err) {
                console.warn('Leave conversation error:', err);
            }
        }

        setSelectedConversation(conv);
        currentConversationRef.current = conv.id;
        await loadMessages(conv.id);

        // Join new conversation
        if (connection && isConnected) {
            try {
                await connection.invoke('JoinConversation', conv.id);
            } catch (err) {
                console.error('Join conversation error:', err);
            }
        }
    }, [connection, isConnected, loadMessages]);

    // Send message
    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || !selectedConversation || !connection || !isConnected) {
            return false;
        }

        try {
            await connection.invoke('SendMessage', {
                conversationId: selectedConversation.id,
                content: content.trim(),
            });
            return true;
        } catch (err) {
            console.error('Send message error:', err);
            setError(err.message);
            return false;
        }
    }, [selectedConversation, connection, isConnected]);

    // Setup SignalR listeners
    useEffect(() => {
        if (!connection) return;

        const handleReceiveMessage = (message) => {
            // Add to messages if in current conversation
            if (currentConversationRef.current === message.conversationId) {
                setMessages(prev => [...prev, message]);
            }

            // Update conversation list
            setConversations(prev =>
                prev.map(conv => {
                    if (conv.id === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: message,
                            unreadCount:
                                currentConversationRef.current === message.conversationId
                                    ? 0
                                    : (conv.unreadCount || 0) + 1,
                        };
                    }
                    return conv;
                })
            );
        };

        const handleUserTyping = (userId, isTyping) => {
            // Handle typing indicator
            console.log('User typing:', userId, isTyping);
        };

        const handleMessagesRead = (userId, conversationId) => {
            // Update read status
            if (currentConversationRef.current === conversationId) {
                setMessages(prev =>
                    prev.map(msg => ({ ...msg, isRead: true }))
                );
            }
        };

        connection.on('ReceiveMessage', handleReceiveMessage);
        connection.on('UserTypingStatus', handleUserTyping);
        connection.on('MessagesMarkedAsRead', handleMessagesRead);

        return () => {
            connection.off('ReceiveMessage', handleReceiveMessage);
            connection.off('UserTypingStatus', handleUserTyping);
            connection.off('MessagesMarkedAsRead', handleMessagesRead);
        };
    }, [connection]);

    // Load courses on mount
    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    // Load conversations when course changes
    useEffect(() => {
        if (selectedCourse) {
            loadConversations(selectedCourse.id);
        }
    }, [selectedCourse, loadConversations]);

    return {
        courses,
        selectedCourse,
        setSelectedCourse,
        conversations,
        selectedConversation,
        selectConversation,
        messages,
        sendMessage,
        loading,
        error,
        isConnected,
    };
};