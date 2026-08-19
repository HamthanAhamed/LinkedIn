const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const postController = require('../controllers/postController');

router.get('/feed', auth, postController.getFeed);
router.post('/', auth, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.post('/:id/like', auth, postController.toggleLike);
router.delete('/:id/like', auth, postController.toggleLike);
router.post('/:id/comments', auth, postController.addComment);
router.delete('/comments/:id', auth, postController.deleteComment);

module.exports = router;