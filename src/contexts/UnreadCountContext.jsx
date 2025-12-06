import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { chatAPI } from '../services/chatAPI';

const UnreadCountContext = createContext();

export const UnreadCountProvider = ({ children, userId, authToken }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const connectionRef = useRef(null);

    // 1. Hàm gọi API lấy số lượng chuẩn xác
    const fetchUnreadCount = useCallback(async () => {
        //if (!userId) return;
        try {
            const res = await chatAPI.getUnreadConversationCount(0);
            const count = res && res.count !== undefined ? res.count : (res || 0);
            setUnreadCount(count);
            console.log("🔥 Header Count Updated:", count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [userId]);

    // 2. Kết nối SignalR (Chỉ để nghe Notification)
    useEffect(() => {
        console.log("useEffect UnreadCountContext:", { userId, authToken });
        if (!userId || !authToken) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5230';

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/chatHub`, {
                accessTokenFactory: () => authToken,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect() // Tự động kết nối lại nếu rớt mạng
            .configureLogging(signalR.LogLevel.None) // Tắt log cho gọn console
            .build();

        connectionRef.current = connection;

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("🟢 UnreadCount Socket Connected");

                // Load lần đầu khi kết nối thành công
                fetchUnreadCount();
            } catch (err) {
                console.error("SignalR Connection Error:", err);
            }
        };

        // --- LẮNG NGHE SỰ KIỆN REALTIME ---

        // A. Khi có người nhắn tin đến (mà mình không ở trong phòng chat)
        connection.on("NewMessageNotification", () => {
            // Có thông báo -> Chắc chắn số lượng thay đổi -> Gọi API cập nhật
            fetchUnreadCount();
        });

        // B. (Tùy chọn) Khi có tin nhắn đến (kể cả khi đang ở trong phòng)
        // Dùng cái này để đảm bảo đồng bộ tuyệt đối, API sẽ quyết định số là bao nhiêu
        connection.on("ReceiveMessage", () => {
            fetchUnreadCount();
        });

        // Kết nối lại thì load lại số
        connection.onreconnected(() => {
            fetchUnreadCount();
        });

        startConnection();

        return () => {
            connection.off("NewMessageNotification");
            connection.off("ReceiveMessage");
            connection.stop();
        };
    }, [userId, authToken, fetchUnreadCount]);

    return (
        <UnreadCountContext.Provider value={{ unreadCount, refreshUnreadCount: fetchUnreadCount }}>
            {children}
        </UnreadCountContext.Provider>
    );
};

export const useUnreadCount = () => {
    return useContext(UnreadCountContext);
};