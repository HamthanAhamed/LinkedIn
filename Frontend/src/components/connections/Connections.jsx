import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './connections.css';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const [connectionsRes, requestsRes] = await Promise.all([
        api.get('/connections'),
        api.get('/connections/pending')
      ]);
      
      setConnections(connectionsRes.data);
      setPendingRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (userId, action) => {
    try {
      if (action === 'accept') {
        await api.post(`/connections/accept/${userId}`);
      } else if (action === 'reject') {
        await api.post(`/connections/reject/${userId}`);
      }
      fetchConnections();
    } catch (error) {
      console.error(`Error ${action} request:`, error);
    }
  };

  const handleRemove = async (userId) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      try {
        await api.delete(`/connections/${userId}`);
        fetchConnections();
      } catch (error) {
        console.error('Error removing connection:', error);
      }
    }
  };

  if (loading) {
    return <div className="connections-loading">Loading...</div>;
  }

  return (
    <div className="connections-container">
      <div className="connections-header">
        <h1>Connections</h1>
        <div className="connections-tabs">
          <button
            className={activeTab === 'connections' ? 'active' : ''}
            onClick={() => setActiveTab('connections')}
          >
            My Connections ({connections.length})
          </button>
          <button
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingRequests.length})
          </button>
        </div>
      </div>

      <div className="connections-list">
        {activeTab === 'connections' ? (
          connections.length > 0 ? (
            connections.map(connection => (
              <div key={connection.id} className="connection-item">
                <img 
                  src={connection.profilePicture || '/default-avatar.png'} 
                  alt={connection.name}
                  className="connection-avatar"
                />
                <div className="connection-info">
                  <Link to={`/profile/${connection.id}`}>
                    <h4>{connection.name}</h4>
                  </Link>
                  <p>{connection.headline || 'No headline'}</p>
                  <div className="connection-meta">
                    <span>{connection.mutualConnections || 0} mutual connections</span>
                  </div>
                </div>
                <div className="connection-actions">
                  <Link to={`/messages/${connection.id}`}>
                    <button className="btn-message">Message</button>
                  </Link>
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemove(connection.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>You don't have any connections yet.</p>
              <Link to="/search" className="btn-find-people">Find People</Link>
            </div>
          )
        ) : (
          pendingRequests.length > 0 ? (
            pendingRequests.map(request => (
              <div key={request.id} className="connection-item pending">
                <img 
                  src={request.profilePicture || '/default-avatar.png'} 
                  alt={request.name}
                  className="connection-avatar"
                />
                <div className="connection-info">
                  <Link to={`/profile/${request.id}`}>
                    <h4>{request.name}</h4>
                  </Link>
                  <p>{request.headline || 'No headline'}</p>
                </div>
                <div className="connection-actions">
                  <button 
                    className="btn-accept"
                    onClick={() => handleRequest(request.id, 'accept')}
                  >
                    Accept
                  </button>
                  <button 
                    className="btn-decline"
                    onClick={() => handleRequest(request.id, 'reject')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No pending connection requests.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Connections;