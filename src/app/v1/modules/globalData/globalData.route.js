const express = require('express');
const globalController = require('./globalData.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();


router.get('/api/v1/admin/global', verifyJWT,verifyAdmin, globalController.getGlobalData);
router.patch('/api/v1/admin/global/:id', verifyJWT , verifyAdmin, globalController.updateGlobalData);
router.patch('/api/v1/admin/payment/edit/:id', verifyJWT , verifyAdmin, globalController.updatePaymentEdit);

module.exports = router;