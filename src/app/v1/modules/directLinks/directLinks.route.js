const express = require('express');
const directController = require('./directLinks.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/direct',verifyJWT, verifyAdmin, directController.createDirect);
router.get('/api/v1/admin/directs', verifyJWT,verifyAdmin, directController.getDirects);
router.patch('/api/v1/admin/direct/status/:id', verifyJWT , verifyAdmin, directController.updateStatus);
router.delete('/api/v1/admin/direct/:id', verifyJWT , verifyAdmin, directController.deleteDirect);

router.get('/api/v1/admin/directs/submit', verifyJWT,verifyAdmin, directController.getDirectsSubmit);
router.patch('/api/v1/admin/direct/status/:id', verifyJWT , verifyAdmin, directController.updateStatus);

router.patch('/api/v1/admin/direct/submit/status/:id', verifyJWT , verifyAdmin, directController.updateDirectSubmitStatus);
router.delete('/api/v1/admin/direct/submit/:id', verifyJWT , verifyAdmin, directController.deleteDirectSubmit);
module.exports = router;