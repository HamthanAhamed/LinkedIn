exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    // Get user's connections
    const connections = global.db.connections
      .filter(c => 
        (c.userId === userId && c.status === 'connected') ||
        (c.connectionId === userId && c.status === 'connected')
      )
      .map(c => c.userId === userId ? c.connectionId : c.userId);

    // Add the user themselves to the feed
    const feedUsers = [...connections, userId];

    // Get posts from feed users
    let feedPosts = global.db.posts
      .filter(post => feedUsers.includes(post.userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add user details to posts
    feedPosts = feedPosts.map(post => {
      const user = global.db.users.find(u => u.id === post.userId);
      const likes = global.db.likes.filter(l => l.postId === post.id);
      const comments = global.db.comments
        .filter(c => c.postId === post.id)
        .map(comment => {
          const commentUser = global.db.users.find(u => u.id === comment.userId);
          return { ...comment, user: commentUser };
        });
      
      return {
        ...post,
        user: user ? { id: user.id, name: user.name, headline: user.headline, profilePicture: user.profilePicture } : null,
        likesCount: likes.length,
        isLiked: likes.some(l => l.userId === userId),
        comments,
        commentCount: comments.length
      };
    });

    const paginatedPosts = feedPosts.slice(start, end);

    res.json({
      posts: paginatedPosts,
      page,
      limit,
      total: feedPosts.length
    });
  } catch (error) {
    console.error('Error getting feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user.id;

    if (!content && !image) {
      return res.status(400).json({ message: 'Post must have content or image' });
    }

    const newPost = {
      id: global.db.nextId.post++,
      userId,
      content,
      image: image || null,
      createdAt: new Date().toISOString()
    };

    global.db.posts.push(newPost);
    
    // Update user's post count
    const user = global.db.users.find(u => u.id === userId);
    if (user) user.postsCount = (user.postsCount || 0) + 1;

    // Get user details for response
    const userData = global.db.users.find(u => u.id === userId);
    const responsePost = {
      ...newPost,
      user: {
        id: userData.id,
        name: userData.name,
        headline: userData.headline,
        profilePicture: userData.profilePicture
      },
      likesCount: 0,
      isLiked: false,
      comments: [],
      commentCount: 0
    };

    res.status(201).json(responsePost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    const { content, image } = req.body;

    const postIndex = global.db.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = global.db.posts[postIndex];
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    if (content) post.content = content;
    if (image) post.image = image;

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    const postIndex = global.db.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = global.db.posts[postIndex];
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Remove post
    global.db.posts.splice(postIndex, 1);
    
    // Remove related likes and comments
    global.db.likes = global.db.likes.filter(l => l.postId !== postId);
    global.db.comments = global.db.comments.filter(c => c.postId !== postId);

    // Update user's post count
    const user = global.db.users.find(u => u.id === userId);
    if (user) user.postsCount = Math.max(0, (user.postsCount || 0) - 1);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    const postExists = global.db.posts.some(p => p.id === postId);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLikeIndex = global.db.likes.findIndex(
      l => l.postId === postId && l.userId === userId
    );

    if (existingLikeIndex > -1) {
      // Unlike
      global.db.likes.splice(existingLikeIndex, 1);
      res.json({ liked: false });
    } else {
      // Like
      global.db.likes.push({
        id: global.db.nextId.like++,
        postId,
        userId,
        createdAt: new Date().toISOString()
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const postExists = global.db.posts.some(p => p.id === postId);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      id: global.db.nextId.comment++,
      postId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };

    global.db.comments.push(newComment);

    const user = global.db.users.find(u => u.id === userId);
    const responseComment = {
      ...newComment,
      user: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture
      }
    };

    res.status(201).json(responseComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;

    const commentIndex = global.db.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = global.db.comments[commentIndex];
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    global.db.comments.splice(commentIndex, 1);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};