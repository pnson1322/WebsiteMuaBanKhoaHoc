// src/pages/SellerChat.jsx
import React, { useState, useEffect, useContext } from "react";
import { ChatProvider } from '../../contexts/ChatContext';
import ConversationList from '../../components/Chat/ConversationList';
import MessagePanel from '../../components/Chat/MessagePanel';
import CourseList from '../../components/Chat/CourseList';
import AuthContext from "../../contexts/AuthContext";
import './SellerChat.css';

const SellerChat = () => {
    const { user, isLoggedIn, loading } = useContext(AuthContext);
    const [sellerId, setSellerId] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        if (user && user.id) {
            setSellerId(user.id);
        }
        // Lấy token từ localStorage
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        setAccessToken(token);
    }, [user]);

    if (loading) {
        return (
            <div className="chat-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin người dùng...</p>
            </div>
        );
    }

    if (!isLoggedIn || !sellerId || !accessToken) {
        console.log('Auth state:', { isLoggedIn, user, loading, accessToken });
        console.log('Token in localStorage:', localStorage.getItem('accessToken'));
        return (
            <div className="chat-loading">
                <p>Vui lòng đăng nhập để sử dụng chat</p>
            </div>
        );
    }

    return (
        <ChatProvider sellerId={sellerId} authToken={accessToken}>
            <div className="seller-chat">
                <div className="chat-container">
                    <div className="chat-panel conversation-panel">
                        <ConversationList />
                    </div>
                    <div className="chat-panel message-panel">
                        <MessagePanel />
                    </div>
                    <div className="chat-panel course-panel">
                        <CourseList sellerId={sellerId} />
                    </div>
                </div>
            </div>
        </ChatProvider>
    );
};

export default SellerChat;
