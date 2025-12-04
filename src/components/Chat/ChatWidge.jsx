import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWidge.css'; // Đảm bảo file CSS vẫn tồn tại

const ChatWidget = ({ teacherId, teacherName = "Giảng viên", courseId }) => {
    const { user } = useAuth();

    // UI States
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data States
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);

    // SignalR States
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs (Để truy cập state mới nhất trong callback của SignalR)
    const messagesEndRef = useRef(null);
    const connectionRef = useRef(null);
    const conversationIdRef = useRef(null);

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
    }, [messages, isOpen]);

    // --- 3. INIT LOGIC (QUAN TRỌNG NHẤT) ---
    // Hàm này gọi API getOrCreateConversation ngay khi mở chat
    const initializeChat = useCallback(async () => {
        if (!user || !teacherId) return;

        try {
            setLoading(true);

            // Bước 1: Lấy hoặc Tạo conversation từ Server (Server-side logic)
            // Không cần lọc list ở client nữa, cực nhanh và chính xác
            const conv = await chatAPI.getOrCreateConversation(teacherId, courseId);

            if (conv && conv.id) {
                console.log('✅ Conversation initialized:', conv.id);
                setConversationId(conv.id);

                // Bước 2: Load tin nhắn cũ
                await loadMessages(conv.id);
            }
        } catch (error) {
            console.error('❌ Error initializing chat:', error);
        } finally {
            setLoading(false);
        }
    }, [user, teacherId, courseId]);

    // Load Messages Helper
    const loadMessages = async (convId) => {
        try {
            const response = await chatAPI.getMessages(convId);
            // Xử lý response tùy theo cấu trúc trả về (mảng hoặc object phân trang)
            const messagesArray = Array.isArray(response) ? response : (response.items || []);

            const mappedMessages = messagesArray.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.senderId,
                senderName: msg.senderName || (msg.senderId === user?.id ? 'Bạn' : teacherName),
                createdAt: msg.createdAt,
                isRead: msg.isRead
            }));

            // Nếu chưa có tin nhắn nào, hiển thị lời chào ảo (Client-side only)
            if (mappedMessages.length === 0) {
                setMessages([{
                    id: 'welcome',
                    content: `Xin chào! Tôi là ${teacherName}. Tôi có thể giúp gì cho bạn về khóa học này?`,
                    senderId: teacherId, // Giả lập ID của thầy
                    senderName: teacherName,
                    createdAt: new Date().toISOString(),
                    isSystem: true // Flag để style khác nếu cần
                }]);
            } else {
                setMessages(mappedMessages);
            }

            // Đánh dấu đã đọc
            await chatAPI.markAsRead(convId);
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        }
    };

    // Gọi initialize khi mở chat
    useEffect(() => {
        if (isOpen && user && !conversationId) {
            initializeChat();
        }
    }, [isOpen, user, conversationId, initializeChat]);


    // --- 4. SIGNALR SETUP ---
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

        const handleNewMessage = (message) => {
            // Chỉ nhận tin nhắn của Conversation đang mở
            if (conversationIdRef.current === message.conversationId) {
                setMessages(prev => {
                    // Chống trùng lặp tin nhắn
                    if (prev.some(m => m.id === message.id)) return prev;

                    // Xóa tin nhắn chào mừng (nếu có) khi có tin nhắn thật đầu tiên
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

                // Scroll xuống dưới khi có tin mới
                setTimeout(scrollToBottom, 100);
            }
        };

        // Đăng ký sự kiện
        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('NewMessageNotification', (data) => {
            const message = data.message || data.Message;
            if (message) handleNewMessage(message);
        });

        startConnection();

        return () => {
            connection.off('ReceiveMessage');
            connection.off('NewMessageNotification');
        };
    }, [connection, user, teacherName]);

    // Join Room khi có Conversation ID
    useEffect(() => {
        if (conversationId && connection?.state === signalR.HubConnectionState.Connected) {
            connection.invoke('JoinConversation', conversationId)
                .then(() => console.log(`👉 Joined room: ${conversationId}`))
                .catch(err => console.error('Join room failed:', err));

            return () => {
                connection.invoke('LeaveConversation', conversationId)
                    .catch(() => { });
            };
        }
    }, [conversationId, isConnected, connection]);


    // --- 5. SEND MESSAGE LOGIC ---
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !user || !conversationId) return;

        const messageContent = inputMessage;
        const tempId = `temp-${Date.now()}`;

        // Optimistic Update: Hiển thị ngay lập tức để UX mượt
        const tempMessage = {
            id: tempId,
            content: messageContent,
            senderId: user.id,
            senderName: 'Bạn',
            createdAt: new Date().toISOString(),
            isTemp: true // Flag để làm mờ hoặc hiện spinner nếu muốn
        };

        // Xóa welcome message, thêm temp message
        setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), tempMessage]);
        setInputMessage('');

        try {
            // Ưu tiên gửi qua SignalR
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                await connectionRef.current.invoke('SendMessage', {
                    ConversationId: conversationId,
                    Content: messageContent,
                    Attachments: []
                });
                // Note: Khi server nhận được, nó sẽ bắn lại event 'ReceiveMessage'
                // Lúc đó React sẽ update lại message thật. 
                // Ta có thể xóa temp message ở đây hoặc đợi message thật về để thay thế.
                // Đơn giản nhất là xóa temp đi sau 1 khoảng ngắn hoặc để message thật tự append.
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
            // Fallback gửi qua API nếu mất kết nối socket
            else {
                console.warn('⚠️ SignalR disconnected, using HTTP Fallback');
                await chatAPI.sendMessage(conversationId, messageContent);
                // Với API, cần load lại tin nhắn hoặc tự thêm vào
                await loadMessages(conversationId);
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
        } catch (error) {
            console.error('❌ Send failed:', error);
            alert('Gửi tin nhắn thất bại. Vui lòng thử lại.');

            // Rollback: Xóa temp message, trả lại text vào input
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
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-message ${msg.senderId === user?.id ? 'user-message' : 'teacher-message'
                                        } ${msg.isTemp ? 'temp-message' : ''}`}
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
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="chat-input-container">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
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