exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const connections = global.db.connections
      .filter(c => 
        (c.userId === userId || c.connectionId === userId) && 
        c.status === 'connected'
      )
      .map(c => {
        const connectionId = c.userId === userId ? c.connectionId : c.userId;
        const user = global.db.users.find(u => u.id === connectionId);
        if (user) {
          const { password, ...userData } = user;
          return userData;
        }
        return null;
      })
      .filter(Boolean);

    res.json(connections);
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pendingRequests = global.db.connections
      .filter(c => c.connectionId === userId && c.status === 'pending')
      .map(c => {
        const user = global.db.users.find(u => u.id === c.userId);
        if (user) {
          const { password, ...userData } = user;
          return userData;
        }
        return null;
      })
      .filter(Boolean);

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    const connection = global.db.connections.find(c => 
      (c.userId === userId && c.connectionId === targetUserId) ||
      (c.userId === targetUserId && c.connectionId === userId)
    );

    let status = null;
    if (connection) {
      status = connection.status;
      // If the connection request was sent to the user, it's pending
      if (connection.userId === targetUserId && connection.status === 'pending') {
        status = 'received';
      }
    }

    res.json({ status });
  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    const existingConnection = global.db.connections.find(c => 
      (c.userId === userId && c.connectionId === targetUserId) ||
      (c.userId === targetUserId && c.connectionId === userId)
    );

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const newConnection = {
      id: global.db.nextId.connection++,
      userId,
      connectionId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    global.db.connections.push(newConnection);
    res.status(201).json({ message: 'Connection request sent' });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    const connectionIndex = global.db.connections.findIndex(c => 
      c.userId === targetUserId && 
      c.connectionId === userId && 
      c.status === 'pending'
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    global.db.connections[connectionIndex].status = 'connected';
    
    // Update connection counts
    const user = global.db.users.find(u => u.id === userId);
    const targetUser = global.db.users.find(u => u.id === targetUserId);
    if (user) user.connectionsCount = (user.connectionsCount || 0) + 1;
    if (targetUser) targetUser.connectionsCount = (targetUser.connectionsCount || 0) + 1;

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    const connectionIndex = global.db.connections.findIndex(c => 
      c.userId === targetUserId && 
      c.connectionId === userId && 
      c.status === 'pending'
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    global.db.connections.splice(connectionIndex, 1);
    res.json({ message: 'Connection request declined' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    const connectionIndex = global.db.connections.findIndex(c => 
      (c.userId === userId && c.connectionId === targetUserId) ||
      (c.userId === targetUserId && c.connectionId === userId)
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    global.db.connections.splice(connectionIndex, 1);
    res.json({ message: 'Connection removed' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};