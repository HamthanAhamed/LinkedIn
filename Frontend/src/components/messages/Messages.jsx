import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./messages.css";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get("/messages/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post(`/messages/${selectedConversation.id}`, {
        content: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="messages-container">
      <div className="conversations-sidebar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <img
                src={conversation.participant?.profilePicture || '/default-avatar.png'}
                alt={conversation.participant?.name}
                className="conv-avatar"
              />
              <div className="conv-info">
                <h4>{conversation.participant?.name}</h4>
                <p>{conversation.lastMessage?.content || "No messages yet"}</p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="unread-badge">{conversation.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <img
                src={selectedConversation.participant?.profilePicture || '/default-avatar.png'}
                alt={selectedConversation.participant?.name}
                className="chat-avatar"
              />
              <h3>{selectedConversation.participant?.name}</h3>
            </div>

            <div className="messages-list">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === user?.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <h3>Select a conversation to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;