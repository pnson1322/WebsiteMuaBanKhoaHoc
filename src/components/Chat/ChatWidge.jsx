import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../../services/chatAPI'; // Đảm bảo API này hỗ trợ page, pageSize
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './ChatWidge.css';

const ChatWidget = ({ teacherId, teacherName = "Giảng viên", courseId }) => {
    const { user } = useAuth();
    const [conversation, setConversation] = useState(null);

    // UI States
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Loading lần đầu
    const [isLoadingOld, setIsLoadingOld] = useState(false); // Loading khi kéo lên

    // Data States
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);

    // Pagination States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Status States
    const [isTeacherTyping, setIsTeacherTyping] = useState(false);
    const [isTeacherActive, setIsTeacherActive] = useState(false);

    // SignalR States
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const connectionRef = useRef(null);
    const conversationIdRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ✅ Refs cho Scroll & Pagination
    const chatContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(null);
    const lastMessageIdRef = useRef(null);

    const { showSuccess, showError } = useToast();

    // --- 1. SYNC REFS ---
    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // --- 2. LOGIC SCROLL THÔNG MINH ---
    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    // Chỉ cuộn xuống đáy khi tin nhắn MỚI NHẤT thay đổi (nhận tin mới/gửi tin)
    // Không cuộn khi load tin cũ
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        // Nếu ID tin cuối khác lần trước -> Có tin mới ở đáy -> Cuộn
        if (lastMessageIdRef.current !== lastMessage.id) {
            // Nếu đang mở widget thì mới cuộn
            if (isOpen) scrollToBottom();
        }

        lastMessageIdRef.current = lastMessage.id;
    }, [messages, isOpen]);

    // Cuộn xuống khi thầy đang gõ (chỉ nếu đang ở gần đáy - optional)
    useEffect(() => {
        if (isTeacherTyping && isOpen) {
            scrollToBottom();
        }
    }, [isTeacherTyping, isOpen]);

    // --- 3. INIT LOGIC ---
    const initializeChat = useCallback(async () => {
        if (!user || !teacherId) return;

        try {
            setLoading(true);
            const conv = await chatAPI.getOrCreateConversation(teacherId, courseId);

            if (conv && conv.id) {
                console.log('✅ Conversation initialized:', conv.id);
                setConversationId(conv.id);
                setConversation(conv);
                // Reset page về 1 khi init
                setPage(1);
                setHasMore(true);
                await loadMessages(conv.id, 1);
            }
        } catch (error) {
            console.error('❌ Error initializing chat:', error);
        } finally {
            setLoading(false);
        }
    }, [user, teacherId, courseId]);

    // ✅ Hàm Load Message hỗ trợ Page
    const loadMessages = async (convId, pageNum) => {
        try {
            const pageSize = 20;
            const response = await chatAPI.getMessages(convId, pageNum, pageSize);

            // Xử lý response (theo cấu trúc chuẩn { items, totalCount })
            const messagesArray = response.items || (Array.isArray(response) ? response : []);
            const totalCount = response.totalCount || 0;

            const mappedMessages = messagesArray.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.senderId,
                senderName: msg.senderName || (msg.senderId === user?.id ? 'Bạn' : teacherName),
                createdAt: msg.createdAt,
                isRead: msg.isRead,
                isSystem: false
            }));

            // Nếu là trang 1 (Load lần đầu)
            if (pageNum === 1) {
                if (mappedMessages.length === 0) {
                    setMessages([{
                        id: 'welcome',
                        content: `Xin chào! Tôi là ${teacherName}. Tôi có thể giúp gì cho bạn về khóa học này?`,
                        senderId: teacherId,
                        senderName: teacherName,
                        createdAt: new Date().toISOString(),
                        isSystem: true
                    }]);
                    setHasMore(false);
                } else {
                    setMessages(mappedMessages);
                    // Check hasMore
                    setHasMore(mappedMessages.length === pageSize && mappedMessages.length < totalCount);
                }

                // Cuộn xuống đáy ngay lập tức sau khi load trang 1
                setTimeout(() => scrollToBottom(false), 100);
            }
            // Nếu là các trang sau (Load tin cũ)
            else {
                if (mappedMessages.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNew = mappedMessages.filter(m => !existingIds.has(m.id));
                        return [...uniqueNew, ...prev]; // Nối vào đầu
                    });

                    const estimatedLoaded = pageNum * pageSize;
                    setHasMore(mappedMessages.length === pageSize && estimatedLoaded < totalCount);
                } else {
                    setHasMore(false);
                }
            }

            // Mark read chỉ gọi khi load trang 1
            if (pageNum === 1) {
                await chatAPI.markAsRead(convId);
            }

        } catch (error) {
            console.error('❌ Error loading messages:', error);
            if (pageNum === 1) setMessages([]);
        }
    };

    // ✅ Handle Scroll (Kéo lên đỉnh)
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight } = e.target;

        if (scrollTop === 0 && hasMore && !loading && !isLoadingOld) {
            // Lưu chiều cao trước khi load
            prevScrollHeightRef.current = scrollHeight;
            loadOldMessages();
        }
    };

    const loadOldMessages = async () => {
        if (!conversationId) return;
        setIsLoadingOld(true);
        const nextPage = page + 1;
        await loadMessages(conversationId, nextPage);
        setPage(nextPage);
        setIsLoadingOld(false);
    };

    // ✅ Giữ vị trí cuộn (Scroll Restoration)
    useLayoutEffect(() => {
        if (!isLoadingOld && prevScrollHeightRef.current && chatContainerRef.current) {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            const heightDiff = newScrollHeight - prevScrollHeightRef.current;

            chatContainerRef.current.scrollTop = heightDiff;
            prevScrollHeightRef.current = null;
        }
    }, [messages, isLoadingOld]);


    useEffect(() => {
        if (isOpen && user && !conversationId) {
            initializeChat();
        }
    }, [isOpen, user, conversationId, initializeChat]);

    // --- 4. SIGNALR SETUP & HANDLERS (Giữ nguyên phần lớn) ---
    useEffect(() => {
        if (!user || !isOpen) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5230';
        const token = localStorage.getItem('token'); // Hoặc lấy từ useAuth nếu có

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/chatHub`, {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        setConnection(newConnection);

        return () => {
            if (newConnection) newConnection.stop();
        };
    }, [user, isOpen]);

    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            try {
                if (connection.state === signalR.HubConnectionState.Disconnected) {
                    await connection.start();
                    console.log('✅ ChatHub Connected');
                    setIsConnected(true);
                }
            } catch (error) {
                console.error('❌ ChatHub Connection Error:', error);
                setIsConnected(false);
            }
        };

        // --- HANDLERS ---
        const handleNewMessage = (message) => {
            if (conversationIdRef.current === message.conversationId) {
                if (message.senderId !== user.id) {
                    setIsTeacherTyping(false);
                }

                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    const cleanPrev = prev.filter(m => m.id !== 'welcome');
                    return [...cleanPrev, {
                        id: message.id,
                        content: message.content,
                        senderId: message.senderId,
                        senderName: message.senderName || (message.senderId === user?.id ? 'Bạn' : teacherName),
                        createdAt: message.createdAt,
                        isRead: message.isRead
                    }];
                });

                if (isOpen) {
                    connection.invoke('MarkAsRead', message.conversationId).catch(() => { });
                }
            }
        };

        const handleUserTypingStatus = (userId, isTyping) => {
            if (userId === teacherId) {
                setIsTeacherTyping(isTyping);
            }
        };

        const handleUserJoined = (joinedUserId) => {
            if (joinedUserId === teacherId) setIsTeacherActive(true);
        };

        const handleUserLeft = (leftUserId) => {
            if (leftUserId === teacherId) {
                setIsTeacherActive(false);
                setIsTeacherTyping(false);
            }
        };

        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('UserTypingStatus', handleUserTypingStatus);
        connection.on('UserJoined', handleUserJoined);
        connection.on('UserLeft', handleUserLeft);
        connection.on('NewMessageNotification', (data) => {
            const message = data.message || data.Message;
            if (message) handleNewMessage(message);
        });

        startConnection();

        return () => {
            connection.off('ReceiveMessage');
            connection.off('NewMessageNotification');
            connection.off('UserTypingStatus');
            connection.off('UserJoined');
            connection.off('UserLeft');
        };
    }, [connection, user, teacherId, teacherName, isOpen]);

    useEffect(() => {
        if (conversationId && connection?.state === signalR.HubConnectionState.Connected) {
            connection.invoke('JoinConversation', conversationId).catch(console.error);
            return () => {
                connection.invoke('LeaveConversation', conversationId).catch(() => { });
            };
        }
    }, [conversationId, isConnected, connection]);


    // --- 5. INPUT & SEND LOGIC (Giữ nguyên) ---
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputMessage(value);
        if (!conversationId || connectionRef.current?.state !== signalR.HubConnectionState.Connected) return;

        if (value.trim().length > 0) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            connectionRef.current.invoke('UserTyping', conversationId, true).catch(console.error);
            typingTimeoutRef.current = setTimeout(() => {
                connectionRef.current.invoke('UserTyping', conversationId, false).catch(console.error);
            }, 1000);
        } else {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            connectionRef.current.invoke('UserTyping', conversationId, false).catch(console.error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !user || !conversationId) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            connectionRef.current.invoke('UserTyping', conversationId, false).catch(() => { });
        }

        const messageContent = inputMessage;
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            content: messageContent,
            senderId: user.id,
            senderName: 'Bạn',
            createdAt: new Date().toISOString(),
            isTemp: true
        };

        setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), tempMessage]);
        setInputMessage('');

        try {
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                await connectionRef.current.invoke('SendMessage', {
                    ConversationId: conversationId,
                    Content: messageContent,
                    Attachments: []
                });
                setMessages(prev => prev.filter(m => m.id !== tempId));
            } else {
                console.warn('⚠️ Using HTTP Fallback');
                await chatAPI.sendMessage(conversationId, messageContent);
                // Sau khi gửi bằng HTTP, load lại trang 1 để đảm bảo đồng bộ
                setPage(1);
                await loadMessages(conversationId, 1);
            }
        } catch (error) {
            console.error('❌ Send failed:', error);

            showError('Bạn đang bị chặn hoặc có lỗi khi gửi tin nhắn.');
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setInputMessage(messageContent);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const avatarUrl = conversation?.sellerAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=random&color=fff`;

    if (!user) return null;

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="chat-bubble-btn">
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <img
                                src={avatarUrl}
                                alt={teacherName}
                                className="teacher-avatar"
                                style={{ objectFit: 'cover' }}
                            />
                            <div>
                                <h4>{teacherName}</h4>

                            </div>
                        </div>
                    </div>

                    {/* ✅ GẮN REF & SỰ KIỆN SCROLL VÀO ĐÂY */}
                    <div
                        className="chat-messages"
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                    >
                        {/* ✅ LOADING CŨ */}
                        {isLoadingOld && (
                            <div style={{ textAlign: 'center', padding: '5px', fontSize: '11px', color: '#999' }}>
                                ⏳ Tải tin nhắn cũ...
                            </div>
                        )}

                        {loading ? (
                            <div className="chat-loading">
                                <Loader className="spinner" size={24} />
                                <p>Đang kết nối...</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`chat-message ${msg.senderId === user?.id ? 'user-message' : 'teacher-message'} ${msg.isTemp ? 'temp-message' : ''}`}>
                                        <div className="message-bubble">
                                            <p>{msg.content}</p>
                                            {!msg.isSystem && (
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isTeacherTyping && (
                                    <div className="typing-indicator-container">
                                        <div className="typing-dots">
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-container">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            className="chat-input"
                            disabled={loading}
                        />
                        <button onClick={handleSendMessage} className="chat-send-btn" disabled={!inputMessage.trim() || loading}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;