import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PostCreate from './PostCreate';
import Post from './Post';
import api from '../../services/api';
import './feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/feed?page=${page}&limit=10`);
      const newPosts = response.data.posts;
      
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  return (
    <div className="feed-container">
      <div className="feed-sidebar">
        {/* User profile card */}
        <div className="profile-card">
          <div className="profile-header">
            <img src={user?.profilePicture || '/default-avatar.png'} alt={user?.name} />
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.headline || 'No headline set'}</p>
        </div>
      </div>

      <div className="feed-main">
        <PostCreate onPostCreated={handlePostCreated} />
        
        {loading && page === 1 ? (
          <div className="loading">Loading posts...</div>
        ) : (
          <>
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                onUpdate={handlePostUpdated}
                onDelete={handlePostDeleted}
              />
            ))}
            
            {hasMore && !loading && (
              <button 
                className="load-more-btn"
                onClick={() => setPage(prev => prev + 1)}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;