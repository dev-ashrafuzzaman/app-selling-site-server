const express = require('express');
const visitController = require('./visitEarn.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/visit',verifyJWT, verifyAdmin, visitController.createVisit);
router.get('/api/v1/admin/visits', verifyJWT,verifyAdmin, visitController.getVisits);
router.patch('/api/v1/admin/visit/status/:id', verifyJWT , verifyAdmin, visitController.updateStatus);
router.delete('/api/v1/admin/visit/:id', verifyJWT , verifyAdmin, visitController.deleteVisit);

module.exports = router;