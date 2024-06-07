const express = require('express');
const UddoktaPayController = require('./UddoktaPayment.controller');
const router = express.Router();

router.post('/api/initiate-payment',UddoktaPayController.initiatePayment);
router.post('/api/verify-payment', UddoktaPayController.verifyPayment);

module.exports = router;