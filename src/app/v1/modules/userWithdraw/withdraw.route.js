const express = require('express');
const withdrawController = require('./withdraw.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/withdraw',verifyJWT, verifyAdmin, withdrawController.createWithdraw);
router.get('/api/v1/admin/pending/withdraws', verifyJWT,verifyAdmin, withdrawController.getPendingWithdraws);
router.get('/api/v1/admin/approved/withdraws', verifyJWT,verifyAdmin, withdrawController.getApprovedWithdraws);
router.get('/api/v1/admin/rejected/withdraws', verifyJWT,verifyAdmin, withdrawController.getRejectedWithdraws);
router.patch('/api/v1/admin/withdraw/:id', verifyJWT , verifyAdmin, withdrawController.updateWithdraw);
router.patch('/api/v1/admin/withdraw/status/:id', verifyJWT , verifyAdmin, withdrawController.updateStatus);
router.delete('/api/v1/admin/withdraw/:id', verifyJWT , verifyAdmin, withdrawController.deleteWithdraw);

module.exports = router;