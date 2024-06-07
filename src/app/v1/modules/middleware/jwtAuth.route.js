const express = require('express');
const router = express.Router();
const authController = require('./jwtAuth.controller');
const verifyJWT = require('./verifyJWT');

router.post('/jwt', authController.generateToken);
router.get('/admin/super-admin/:email', verifyJWT, authController.checkSuperAdmin);

module.exports = router;