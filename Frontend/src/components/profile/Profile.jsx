import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const id = userId || user?.id;
      setIsOwnProfile(id === user?.id);
      
      const response = await api.get(`/users/${id}`);
      setProfile(response.data);
      
      if (!isOwnProfile) {
        fetchConnectionStatus(id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async (targetUserId) => {
    try {
      const response = await api.get(`/connections/status/${targetUserId}`);
      setConnectionStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching connection status:', error);
    }
  };

  const handleConnectionAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'connect':
          response = await api.post(`/connections/request/${profile.id}`);
          setConnectionStatus('pending');
          break;
        case 'accept':
          response = await api.post(`/connections/accept/${profile.id}`);
          setConnectionStatus('connected');
          break;
        case 'reject':
          response = await api.post(`/connections/reject/${profile.id}`);
          setConnectionStatus(null);
          break;
        case 'remove':
          response = await api.delete(`/connections/${profile.id}`);
          setConnectionStatus(null);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
    }
  };

  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'pending':
        return (
          <button className="btn-pending" disabled>
            <span className="icon-clock">⏳</span> Pending
          </button>
        );
      case 'connected':
        return (
          <button 
            className="btn-connected" 
            onClick={() => handleConnectionAction('remove')}
          >
            <span className="icon-check">✅</span> Connected
          </button>
        );
      case 'received':
        return (
          <div className="btn-group">
            <button 
              className="btn-accept" 
              onClick={() => handleConnectionAction('accept')}
            >
              Accept
            </button>
            <button 
              className="btn-reject" 
              onClick={() => handleConnectionAction('reject')}
            >
              Ignore
            </button>
          </div>
        );
      default:
        return (
          <button 
            className="btn-connect" 
            onClick={() => handleConnectionAction('connect')}
          >
            <span className="icon-user-plus">➕</span> Connect
          </button>
        );
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-error">User not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-cover">
          <img src={profile.coverImage || '/default-cover.jpg'} alt="Cover" />
        </div>
        
        <div className="profile-info">
          <div className="profile-avatar-large">
            <img src={profile.profilePicture || '/default-avatar.png'} alt={profile.name} />
          </div>
          
          <div className="profile-details">
            <h1>{profile.name}</h1>
            <p className="profile-headline">{profile.headline || 'No headline set'}</p>
            <p className="profile-location">{profile.location || 'Location not specified'}</p>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{profile.connectionsCount || 0}</span>
                <span className="stat-label">Connections</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profile.postsCount || 0}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profile.followersCount || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>
            
            <div className="profile-actions">
              {isOwnProfile ? (
                <button 
                  className="btn-edit" 
                  onClick={() => setShowEdit(true)}
                >
                  <span className="icon-edit">✏️</span> Edit Profile
                </button>
              ) : (
                getConnectionButton()
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>About</h3>
          <p>{profile.bio || 'No bio provided'}</p>
        </div>

        <div className="profile-section">
          <h3>Experience</h3>
          {profile.experience?.length > 0 ? (
            profile.experience.map(exp => (
              <div key={exp.id} className="experience-item">
                <h4>{exp.title}</h4>
                <p className="company">{exp.company}</p>
                <p className="duration">{exp.startDate} - {exp.endDate || 'Present'}</p>
                <p>{exp.description}</p>
              </div>
            ))
          ) : (
            <p>No experience listed</p>
          )}
        </div>

        <div className="profile-section">
          <h3>Education</h3>
          {profile.education?.length > 0 ? (
            profile.education.map(edu => (
              <div key={edu.id} className="education-item">
                <h4>{edu.school}</h4>
                <p className="degree">{edu.degree}</p>
                <p className="duration">{edu.startDate} - {edu.endDate || 'Present'}</p>
              </div>
            ))
          ) : (
            <p>No education listed</p>
          )}
        </div>

        <div className="profile-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {profile.skills?.length > 0 ? (
              profile.skills.map(skill => (
                <div key={skill.id} className="skill-item">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-endorsements">{skill.endorsements || 0}</span>
                </div>
              ))
            ) : (
              <p>No skills listed</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <ProfileEdit 
          profile={profile} 
          onClose={() => setShowEdit(false)}
          onUpdate={fetchProfile}
        />
      )}
    </div>
  );
};

export default Profile;