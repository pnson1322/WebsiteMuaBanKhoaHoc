import React, { useState, useMemo, useCallback } from "react";
import { useChat } from "../../contexts/ChatContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import "./ConversationList.css";
import ConversationItem from "./ConversationItem";

const ConversationList = () => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    loading,
    unreadCount,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  }, []);

  const mappedConversations = useMemo(() => {
    const safeConversations = Array.isArray(conversations) ? conversations : [];

    return safeConversations.map((conv) => ({
      id: conv.id,
      studentName: conv.buyerName || "Người dùng",
      studentAvatar: conv.buyerAvatar || "",
      courseName: conv.courseTitle || "",
      lastMessage: conv.lastMessage?.content || "Chưa có tin nhắn",
      lastMessageTime: conv.lastMessage?.createdAt || conv.lastMessageAt,
      formattedTime: formatTime(
        conv.lastMessage?.createdAt || conv.lastMessageAt
      ),
      unreadCount: conv.unreadCount || 0,
      isOnline: false,
      raw: conv,
    }));
  }, [conversations, formatTime]);

  const filteredConversations = useMemo(() => {
    return mappedConversations.filter((conv) =>
      conv.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mappedConversations, searchQuery]);

  const handleSelect = useCallback(
    (rawConv) => {
      selectConversation(rawConv);
    },
    [selectConversation]
  );

  return (
    <div className="chat-panel conversation-panel">
      <div className="panel-header">
        <h2 className="header-title">
          Tin nhắn
          {unreadCount > 0 && <span className="main-badge">{unreadCount}</span>}
        </h2>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="conversation-items scrollable-content">
        {loading && mappedConversations.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : mappedConversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-img">📭</div>
            <h3>Chưa có tin nhắn</h3>
            <p>Hộp thư của bạn hiện đang trống.</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy kết quả</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={
                activeConversation?.id?.toString() ===
                conversation.id?.toString()
              }
              onSelect={handleSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
