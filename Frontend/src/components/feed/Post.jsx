import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './feed.css';

const Post = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/posts/${post.id}/like`);
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await api.post(`/posts/${post.id}/like`);
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
      }
      onUpdate({ ...post, isLiked: !isLiked, likesCount: likesCount });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/posts/${post.id}/comments`, {
        content: newComment
      });
      
      setComments(prev => [...prev, response.data]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      onUpdate({ ...post, commentCount: commentCount + 1 });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    alert('Share functionality will be implemented');
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${post.id}`);
        onDelete(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const isOwner = user?.id === post.userId;

  return (
    <div className="post">
      <div className="post-header">
        <img 
          src={post.user?.profilePicture || '/default-avatar.png'} 
          alt={post.user?.name}
          className="post-avatar"
        />
        <div>
          <h4>{post.user?.name}</h4>
          <p className="post-headline">{post.user?.headline}</p>
          <small>{new Date(post.createdAt).toLocaleDateString()}</small>
        </div>
        {isOwner && (
          <div className="post-actions">
            <button className="edit-btn">Edit</button>
            <button className="delete-btn" onClick={handleDeletePost}>Delete</button>
          </div>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-stats">
        <span>{likesCount} likes</span>
        <span>{commentCount} comments</span>
      </div>

      <div className="post-actions-bar">
        <button onClick={handleLike} className="action-btn">
          <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span>{isLiked ? 'Unlike' : 'Like'}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="action-btn">
          <span className="comment-icon">💬</span>
          <span>Comment</span>
        </button>
        <button onClick={handleShare} className="action-btn">
          <span className="share-icon">↗️</span>
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Comment</button>
          </form>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <img 
                  src={comment.user?.profilePicture || '/default-avatar.png'} 
                  alt={comment.user?.name}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <h5>{comment.user?.name}</h5>
                  <p>{comment.content}</p>
                  <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                </div>
                {comment.userId === user?.id && (
                  <button 
                    className="delete-comment-btn"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;