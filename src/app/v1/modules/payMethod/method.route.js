const express = require('express');
const methodController = require('./method.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/method',verifyJWT, verifyAdmin, methodController.createmethod);
router.get('/api/v1/admin/methods', verifyJWT,verifyAdmin, methodController.getmethods);
router.patch('/api/v1/admin/method/:id', verifyJWT , verifyAdmin, methodController.updatemethod);
router.patch('/api/v1/admin/method/status/:id', verifyJWT , verifyAdmin, methodController.updateStatus);
router.delete('/api/v1/admin/method/:id', verifyJWT , verifyAdmin, methodController.deletemethod);

module.exports = router;