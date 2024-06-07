const express = require('express');
const packageController = require('./packages.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/package',verifyJWT, verifyAdmin, packageController.createpackage);
router.get('/api/v1/admin/packages', verifyJWT,verifyAdmin, packageController.getpackages);
router.patch('/api/v1/admin/package/:id', verifyJWT , verifyAdmin, packageController.updatepackage);
router.patch('/api/v1/admin/package/status/:id', verifyJWT , verifyAdmin, packageController.updateStatus);
router.delete('/api/v1/admin/package/:id', verifyJWT , verifyAdmin, packageController.deletepackage);

module.exports = router;