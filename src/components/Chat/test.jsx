import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWidge.css';

const ChatWidget = ({ teacherId, teacherName = "Giảng viên", courseId }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const messagesEndRef = useRef(null);
    const connectionRef = useRef(null);
    const conversationIdRef = useRef(null);

    // Update refs
    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Tìm hoặc tạo conversation
    const findOrCreateConversation = useCallback(async () => {
        if (!user || !teacherId) {
            console.log('⚠️ Missing user or teacherId:', { user, teacherId });
            return;
        }

        try {
            setLoading(true);

            // Lấy danh sách conversations của buyer
            const response = await chatAPI.getConversations(user.id);
            console.log('📦 All conversations response:', response);

            const conversations = response.items || [];
            console.log('📦 Conversations array:', conversations);

            // Tìm conversation với seller này VÀ course này
            const existingConv = conversations.find(conv => {
                // Buyer đang xem thì sellerId phải khớp
                // Nếu có courseId thì courseId cũng phải khớp
                const isSellerMatch = conv.sellerId === teacherId;
                const isCourseMatch = !courseId || conv.courseId === courseId;

                console.log(`🔍 Checking conversation ${conv.id}:`, {
                    convSellerId: conv.sellerId,
                    targetTeacherId: teacherId,
                    isSellerMatch,
                    convCourseId: conv.courseId,
                    targetCourseId: courseId,
                    isCourseMatch,
                    finalMatch: isSellerMatch && isCourseMatch
                });

                return isSellerMatch && isCourseMatch;
            });

            if (existingConv) {
                console.log('✅ Found existing conversation:', existingConv);
                setConversationId(existingConv.id);
                await loadMessages(existingConv.id);
            } else {
                console.log('💬 No conversation found, will create on first message');
                console.log('Search criteria:', { teacherId, courseId });
                setMessages([{
                    id: 'welcome',
                    content: `Xin chào! Tôi là ${teacherName}. Tôi có thể giúp gì cho bạn về khóa học này?`,
                    senderId: teacherId,
                    senderName: teacherName,
                    createdAt: new Date().toISOString(),
                    isSystem: true
                }]);
            }
        } catch (error) {
            console.error('❌ Error finding conversation:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    }, [user, teacherId, teacherName, courseId]);

    // Load messages
    const loadMessages = async (convId) => {
        try {
            console.log('📥 Loading messages for conversation:', convId);
            const response = await chatAPI.getMessages(convId);
            console.log('📦 Raw API response:', response);

            // API trả về mảng trực tiếp, không có wrapper object
            const messagesArray = Array.isArray(response) ? response : (response.items || []);
            console.log('📦 Messages count:', messagesArray.length);

            const mappedMessages = messagesArray.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.senderId,
                senderName: msg.senderName || (msg.senderId === user?.id ? 'Bạn' : teacherName),
                createdAt: msg.createdAt,
                isRead: msg.isRead
            }));

            console.log('✅ Loaded', mappedMessages.length, 'messages');
            setMessages(mappedMessages);

            // Mark as read
            await chatAPI.markAsRead(convId);
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            console.error('Error details:', error.response?.data);
            setMessages([]);
        }
    };

    // Setup SignalR connection
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
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [user, isOpen]);

    // Connection events
    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            try {
                await connection.start();
                console.log('✅ ChatHub Connected');
                setIsConnected(true);
            } catch (error) {
                console.error('❌ ChatHub Connection Error:', error);
                setIsConnected(false);
            }
        };

        // Handle new message
        const handleNewMessage = (message) => {
            console.log('📩 New message received:', message);

            // Chỉ thêm message nếu thuộc conversation hiện tại
            if (conversationIdRef.current === message.conversationId) {
                setMessages(prev => {
                    const isDuplicate = prev.some(m => m.id === message.id);
                    if (isDuplicate) return prev;

                    return [...prev, {
                        id: message.id,
                        content: message.content,
                        senderId: message.senderId,
                        senderName: message.senderName || (message.senderId === user?.id ? 'Bạn' : teacherName),
                        createdAt: message.createdAt,
                        isRead: message.isRead
                    }];
                });
            }
        };

        connection.on('ReceiveMessage', handleNewMessage);
        connection.on('NewMessageNotification', (data) => {
            const message = data.message || data.Message;
            if (message) handleNewMessage(message);
        });

        // Thêm các handlers khác để tránh warning
        connection.on('UserJoined', (userId, connectionId) => {
            console.log(`👤 User ${userId} joined`);
        });

        connection.on('UserLeft', (userId, connectionId) => {
            console.log(`👋 User ${userId} left`);
        });

        connection.on('UserTypingStatus', (userId, isTyping) => {
            console.log(`⌨️ User ${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
        });

        connection.on('MessagesMarkedAsRead', (userId, conversationId) => {
            console.log(`✅ Messages marked as read by user ${userId}`);
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
    }, [connection, user, teacherName]);

    // Join conversation room khi có conversationId
    useEffect(() => {
        if (conversationId && connection?.state === signalR.HubConnectionState.Connected) {
            connection.invoke('JoinConversation', conversationId)
                .then(() => console.log(`✅ Joined conversation: ${conversationId}`))
                .catch(err => console.error('Error joining conversation:', err));

            return () => {
                connection.invoke('LeaveConversation', conversationId)
                    .catch(err => console.error('Error leaving conversation:', err));
            };
        }
    }, [conversationId, connection]);

    // Load conversation khi mở chat
    useEffect(() => {
        if (isOpen && user) {
            findOrCreateConversation();
        }
    }, [isOpen, user, findOrCreateConversation]);

    // Send message
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !user) return;

        const tempMessage = {
            id: `temp-${Date.now()}`,
            content: inputMessage,
            senderId: user.id,
            senderName: 'Bạn',
            createdAt: new Date().toISOString(),
            isTemp: true
        };

        setMessages(prev => [...prev, tempMessage]);
        const messageContent = inputMessage;
        setInputMessage('');

        try {
            let convId = conversationId;

            // Nếu chưa có conversation, tạo mới bằng cách gửi message đầu tiên
            if (!convId) {
                console.log('📝 Creating new conversation...');
                console.log('Data:', { messageContent, teacherId, courseId });

                const response = await chatAPI.sendMessageWithNewConversation(
                    messageContent,
                    teacherId,
                    courseId
                );

                console.log('✅ Created conversation:', response);

                convId = response.conversationId;
                setConversationId(convId);

                // Remove temp message và thêm message thật
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempMessage.id),
                    {
                        id: response.message.id,
                        content: response.message.content,
                        senderId: response.message.senderId,
                        senderName: response.message.senderName,
                        createdAt: response.message.createdAt,
                        isRead: response.message.isRead
                    }
                ]);

                // Join vào conversation mới
                if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                    await connectionRef.current.invoke('JoinConversation', convId);
                    console.log(`✅ Joined new conversation: ${convId}`);
                }

                return;
            }

            // Gửi message qua SignalR nếu đã có conversation
            if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
                await connectionRef.current.invoke('SendMessage', {
                    ConversationId: convId,
                    Content: messageContent,
                    Attachments: []
                });
                console.log('✅ Message sent via SignalR');

                // Remove temp message
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            } else {
                // Fallback: gửi qua API
                console.log('⚠️ SignalR not connected, using API fallback');
                await chatAPI.sendMessage(convId, messageContent);
                console.log('✅ Message sent via API');
                await loadMessages(convId);
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            console.error('Error details:', error.response?.data);

            // Remove temp message
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));

            alert('Gửi tin nhắn thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) return null; // Không hiển thị nếu chưa đăng nhập

    return (
        <>
            {/* Chat Button */}
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
                                <p className="status-online">
                                    {isConnected ? '● Đang hoạt động' : '○ Ngoại tuyến'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {loading ? (
                            <div className="chat-loading">
                                <Loader className="spinner" size={24} />
                                <p>Đang tải tin nhắn...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="chat-empty">
                                <MessageCircle size={48} />
                                <p>Chưa có tin nhắn nào</p>
                                <span>Hãy bắt đầu cuộc trò chuyện!</span>
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
                                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
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