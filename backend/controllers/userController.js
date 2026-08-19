exports.getUserProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = global.db.users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = global.db.users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, headline, location, bio, skills, education, experience } = req.body;

    if (name) user.name = name;
    if (headline) user.headline = headline;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (education) user.education = education;
    if (experience) user.experience = experience;

    const { password, ...updatedUser } = user;
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const searchTerm = q.toLowerCase();
    const results = global.db.users
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.headline?.toLowerCase().includes(searchTerm) ||
        user.skills?.some(skill => skill.toLowerCase().includes(searchTerm))
      )
      .map(user => {
        const { password, ...userData } = user;
        return userData;
      });

    res.json(results);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};