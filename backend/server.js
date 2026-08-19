const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database (for testing)
global.db = {
  users: [],
  posts: [],
  connections: [],
  likes: [],
  comments: [],
  messages: [],
  notifications: [],
  skills: [],
  endorsements: [],
  nextId: {
    user: 1,
    post: 1,
    connection: 1,
    like: 1,
    comment: 1,
    message: 1,
    notification: 1,
    skill: 1,
    endorsement: 1
  }
};

// Add some initial users for testing
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

global.db.users.push({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: bcrypt.hashSync('password123', salt),
  headline: 'Software Engineer at Google',
  location: 'San Francisco, CA',
  bio: 'Full-stack developer passionate about AI and machine learning',
  profilePicture: 'https://i.pravatar.cc/150?img=1',
  skills: ['React', 'Node.js', 'Python', 'AWS'],
  education: [
    {
      id: 1,
      school: 'Stanford University',
      degree: 'B.S. Computer Science',
      startDate: '2016',
      endDate: '2020'
    }
  ],
  experience: [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Google',
      startDate: '2020',
      endDate: 'Present',
      description: 'Working on Google Cloud Platform'
    }
  ],
  connectionsCount: 0,
  postsCount: 0,
  followersCount: 0
});

global.db.users.push({
  id: 2,
  name: 'Jane Smith',
  email: 'jane@example.com',
  password: bcrypt.hashSync('password123', salt),
  headline: 'Senior Product Manager',
  location: 'New York, NY',
  bio: 'Product leader with 10+ years of experience',
  profilePicture: 'https://i.pravatar.cc/150?img=5',
  skills: ['Product Strategy', 'Agile', 'UX Design'],
  education: [
    {
      id: 1,
      school: 'MIT',
      degree: 'MBA',
      startDate: '2014',
      endDate: '2016'
    }
  ],
  experience: [
    {
      id: 1,
      title: 'Senior Product Manager',
      company: 'Amazon',
      startDate: '2018',
      endDate: 'Present',
      description: 'Leading product initiatives'
    }
  ],
  connectionsCount: 0,
  postsCount: 0,
  followersCount: 0
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/connections', require('./routes/connections'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test users: john@example.com / password123`);
  console.log(`Test users: jane@example.com / password123`);
});