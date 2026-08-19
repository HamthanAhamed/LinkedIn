import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './feed.css';

const PostCreate = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onPostCreated(response.data);
      setContent('');
      setImage(null);
      
      // Reset file input
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-create">
      <div className="post-create-header">
        <img 
          src={user?.profilePicture || '/default-avatar.png'} 
          alt={user?.name}
          className="avatar"
        />
        <input
          type="text"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="post-input"
        />
      </div>
      
      <div className="post-create-actions">
        <label htmlFor="image-upload" className="action-btn">
          📷 Photo
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading || (!content.trim() && !image)}
          className="post-btn"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
      
      {image && (
        <div className="image-preview">
          <img src={URL.createObjectURL(image)} alt="Preview" />
          <button onClick={() => setImage(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default PostCreate;