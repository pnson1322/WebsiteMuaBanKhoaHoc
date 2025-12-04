import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWidge.css';

const ChatWidget = ({ teacherId, teacherName = "Giảng viên", courseId }) => {
    const { user } = useAuth();

    // UI States
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data States
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);

    // ✅ State mới: Typing & Status
    const [isTeacherTyping, setIsTeacherTyping] = useState(false);
    const [isTeacherActive, setIsTeacherActive] = useState(false); // Theo dõi thầy có trong phòng không

    // SignalR States
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const connectionRef = useRef(null);
    const conversationIdRef = useRef(null);
    const typingTimeoutRef = useRef(null); // ✅ Ref để debounce typing

    // --- 1. SYNC REFS ---
    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // --- 2. AUTO SCROLL ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTeacherTyping]); // Scroll khi có tin nhắn hoặc typing mới

    // --- 3. INIT LOGIC ---
    const initializeChat = useCallback(async () => {
        if (!user || !teacherId) return;

        try {
            setLoading(true);
            const conv = await chatAPI.getOrCreateConversation(teacherId, courseId);

            if (conv && conv.id) {
                console.log('✅ Conversation initialized:', conv.id);
                setConversationId(conv.id);
                await loadMessages(conv.id);
            }
        } catch (error) {
            console.error('❌ Error initializing chat:', error);
        } finally {
            setLoading(false);
        }
    }, [user, teacherId, courseId]);

    const loadMessages = async (convId) => {
        try {
            const response = await chatAPI.getMessages(convId);
            const messagesArray = Array.isArray(response) ? response : (response.items || []);

            const mappedMessages = messagesArray.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.senderId,
                senderName: msg.senderName || (msg.senderId === user?.id ? 'Bạn' : teacherName),
                createdAt: msg.createdAt,
                isRead: msg.isRead
            }));

            if (mappedMessages.length === 0) {
                setMessages([{
                    id: 'welcome',
                    content: `Xin chào! Tôi là ${teacherName}. Tôi có thể giúp gì cho bạn về khóa học này?`,
                    senderId: teacherId,
                    senderName: teacherName,
                    createdAt: new Date().toISOString(),
                    isSystem: true
                }]);
            } else {
                setMessages(mappedMessages);
            }

            await chatAPI.markAsRead(convId);
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        }
    };

    useEffect(() => {
        if (isOpen && user && !conversationId) {
            initializeChat();
        }
    }, [isOpen, user, conversationId, initializeChat]);

    // --- 4. SIGNALR SETUP & HANDLERS ---
    useEffect(() => {
        if (!user || !isOpen) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5230';
        const token = localStorage.getItem('token');

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/chatHub`, {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
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
                // Khi có tin nhắn mới, tắt typing ngay lập tức
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

                // Mark as read immediately if window is open
                if (isOpen) {
                    connection.invoke('MarkAsRead', message.conversationId).catch(() => { });
                }
            }
        };

        // ✅ Xử lý Trạng thái Typing
        const handleUserTypingStatus = (userId, isTyping) => {
            // Nếu người đang gõ là thầy (không phải mình)
            if (userId === teacherId) {
                setIsTeacherTyping(isTyping);
                if (isTyping) scrollToBottom();
            }
        };

        // ✅ Xử lý Trạng thái Online/Active (Tham gia phòng)
        const handleUserJoined = (joinedUserId) => {
            if (joinedUserId === teacherId) {
                console.log('Teacher joined the room');
                setIsTeacherActive(true);
            }
        };

        // ✅ Xử lý Trạng thái Offline/Inactive (Rời phòng)
        const handleUserLeft = (leftUserId) => {
            if (leftUserId === teacherId) {
                console.log('Teacher left the room');
                setIsTeacherActive(false);
                setIsTeacherTyping(false); // Reset typing nếu họ thoát
            }
        };

        // Đăng ký sự kiện
        connection.on('ReceiveMessage', handleNewMessage);

        // ✅ Đăng ký events mới
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

    // Join Room
    useEffect(() => {
        if (conversationId && connection?.state === signalR.HubConnectionState.Connected) {
            connection.invoke('JoinConversation', conversationId)
                .catch(err => console.error('Join room failed:', err));

            return () => {
                connection.invoke('LeaveConversation', conversationId)
                    .catch(() => { });
            };
        }
    }, [conversationId, isConnected, connection]);


    // --- 5. INPUT & SEND LOGIC ---

    // ✅ Xử lý Input change & gửi sự kiện Typing
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputMessage(value);

        // Kiểm tra kết nối và conversation
        if (!conversationId || connectionRef.current?.state !== signalR.HubConnectionState.Connected) return;

        // --- LOGIC MỚI GIỐNG ĐOẠN CODE BẠN GỬI ---

        // Nếu có text -> Gửi signal typing = true
        if (value.trim().length > 0) {
            // Xóa timeout cũ (nếu user vẫn đang gõ liên tục)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Gửi "Đang gõ" ngay lập tức
            connectionRef.current.invoke('UserTyping', conversationId, true)
                .catch(err => console.error(err));

            // Set timeout: Sau 2 giây không gõ gì thêm -> Gửi "Ngừng gõ"
            typingTimeoutRef.current = setTimeout(() => {
                connectionRef.current.invoke('UserTyping', conversationId, false)
                    .catch(err => console.error(err));
            }, 1000); // Bạn có thể để 1000ms hoặc 2000ms tùy thích
        } else {
            // Nếu xóa hết text -> Gửi signal ngừng gõ NGAY LẬP TỨC
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            connectionRef.current.invoke('UserTyping', conversationId, false)
                .catch(err => console.error(err));
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !user || !conversationId) return;

        // Xóa timeout typing pending và gửi lệnh ngừng gõ ngay
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
                await loadMessages(conversationId);
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
        } catch (error) {
            console.error('❌ Send failed:', error);
            alert('Gửi tin nhắn thất bại.');
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

    if (!user) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="chat-bubble-btn"
                aria-label="Chat với giảng viên"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="teacher-avatar">
                                {teacherName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4>{teacherName}</h4>
                                {/* ✅ Hiển thị trạng thái hoạt động */}
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                                    <span className={`status-indicator ${isTeacherActive ? 'status-online' : 'status-offline'}`}></span>
                                    <span style={{ color: isTeacherActive ? '#2ecc71' : '#95a5a6' }}>
                                        {isTeacherActive ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="chat-messages">
                        {loading ? (
                            <div className="chat-loading">
                                <Loader className="spinner" size={24} />
                                <p>Đang kết nối...</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`chat-message ${msg.senderId === user?.id ? 'user-message' : 'teacher-message'} ${msg.isTemp ? 'temp-message' : ''}`}
                                    >
                                        <div className="message-bubble">
                                            <p>{msg.content}</p>
                                            {!msg.isSystem && (
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* ✅ Hiển thị Typing Indicator */}
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

                    {/* Input Area */}
                    <div className="chat-input-container">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={handleInputChange} // ✅ Thay đổi hàm xử lý ở đây
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            className="chat-input"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="chat-send-btn"
                            disabled={!inputMessage.trim() || loading}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;