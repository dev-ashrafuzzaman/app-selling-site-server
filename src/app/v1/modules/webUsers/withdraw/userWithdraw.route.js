const express = require('express');
const withdrawController = require('./userWithdraw.controller');
const verifyJWT = require('../middleware/webVerifyJWT');
const verifyAdmin = require('../middleware/webVerifyUser');
const router = express.Router();

router.post('/api/v1/web/user/withdraw',verifyJWT, verifyAdmin, withdrawController.createWithdraw);
router.get('/api/v1/web/user/withdraw/:id', verifyJWT,verifyAdmin, withdrawController.getWithdraw);
router.patch('/api/v1/web/user/daily-commission/:id', verifyJWT,verifyAdmin, withdrawController.setDailyCommission);

module.exports = router;