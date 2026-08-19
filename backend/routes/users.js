const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile,
  searchUsers 
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/:id', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/search', auth, searchUsers);

module.exports = router;