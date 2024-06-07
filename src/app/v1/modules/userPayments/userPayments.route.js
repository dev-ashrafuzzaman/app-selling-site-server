const express = require('express');
const paymentController = require('./userPayments.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/payment',verifyJWT, verifyAdmin, paymentController.createPayment);
router.get('/api/v1/admin/payments', verifyJWT,verifyAdmin, paymentController.getPayments);
router.patch('/api/v1/admin/payment/:id', verifyJWT , verifyAdmin, paymentController.updatePayment);
router.patch('/api/v1/admin/payment/status/:id', verifyJWT , verifyAdmin, paymentController.updateStatus);
router.delete('/api/v1/admin/payment/:id', verifyJWT , verifyAdmin, paymentController.deletePayment);

module.exports = router;