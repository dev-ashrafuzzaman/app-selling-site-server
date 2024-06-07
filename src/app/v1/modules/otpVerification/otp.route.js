const express = require('express');
const router = express.Router();
const otpController = require('./otp.controller');

router.post('/web/otp-send', otpController.createOTP);
router.post('/web/otp-verify', otpController.verifyOTP);

module.exports = router;