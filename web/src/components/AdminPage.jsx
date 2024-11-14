import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../assets/styles/admin.css';

function AdminPage() {
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000/api";
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/available-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setAvailableUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedUser,
          content: newMessage
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      setNewMessage('');
      fetchMessages(selectedUser);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartNewConversation = (userId) => {
    setSelectedUser(userId);
    setShowNewConversation(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="admin-container">
      <div className="header">
        <h1>Your Messages</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/profile')} className="profile-button">Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="conversations-list">
          <div className="conversations-header">
            <h2>Conversations</h2>
            <button 
              className="new-conversation-button"
              onClick={() => {
                setShowNewConversation(true);
                fetchAvailableUsers();
              }}
            >
              New Chat
            </button>
          </div>
          {conversations.map(conv => (
            <div 
              key={conv.userId}
              className={`conversation-item ${selectedUser === conv.userId ? 'selected' : ''}`}
              onClick={() => setSelectedUser(conv.userId)}
            >
              <span>{conv.username}</span>
            </div>
          ))}

          {showNewConversation && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Start New Conversation</h3>
                  <button onClick={() => setShowNewConversation(false)}>×</button>
                </div>
                <div className="modal-body">
                  {availableUsers.length > 0 ? (
                    availableUsers.map(user => (
                      <div 
                        key={user.id}
                        className="user-item"
                        onClick={() => handleStartNewConversation(user.id)}
                      >
                        <div className="user-info">
                          <span>{user.username}</span>
                          <small className={`status ${user.status.toLowerCase()}`}>
                            {user.status === 'ONLINE' ? 'Online' : 'Offline'}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-users">No users available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="messages-container">
          {selectedUser ? (
            <>
              <div className="messages-list">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`message ${message.senderId === selectedUser ? 'received' : 'sent'}`}
                  >
                    <p>{message.content}</p>
                    <small>{new Date(message.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
              
              <form onSubmit={sendMessage} className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;