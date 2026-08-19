const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const connectionController = require('../controllers/connectionController');

router.get('/', auth, connectionController.getConnections);
router.get('/pending', auth, connectionController.getPendingRequests);
router.get('/status/:userId', auth, connectionController.getConnectionStatus);
router.post('/request/:userId', auth, connectionController.sendRequest);
router.post('/accept/:userId', auth, connectionController.acceptRequest);
router.post('/reject/:userId', auth, connectionController.rejectRequest);
router.delete('/:userId', auth, connectionController.removeConnection);

module.exports = router;