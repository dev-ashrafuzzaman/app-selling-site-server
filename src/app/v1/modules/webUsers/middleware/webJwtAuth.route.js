const express = require('express');
const router = express.Router();
const webAuthController = require('./webJwtAuth.controller');
const webVerifyJWT = require('./webVerifyJWT');

router.post('/web-jwt', webAuthController.webGenerateToken);
router.get('/web/user/:email', webVerifyJWT, webAuthController.checkWebUser);
router.get('/admin/software/seed/database', webAuthController.webSeed);

module.exports = router;