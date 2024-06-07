const express = require('express');
const userController = require('./users.controller');
const verifyJWT = require('../../webUsers/middleware/webVerifyJWT');
const verifyAdmin = require('../../webUsers/middleware/webVerifyUser');
const router = express.Router();

router.get('/api/v1/web/utils',  userController.webUtils);
router.get('/api/v1/web/user',  userController.webAllUsers);
router.post('/api/v1/web/user/login',  userController.webUserLogin);
router.post('/api/v1/web/user/register',userController.webUserRegister);
router.patch('/api/v1/web/user/password-change/:id',verifyJWT,verifyAdmin, userController.updatePassword);

router.get('/api/v1/web/public/product/:id',userController.getWebProduct);
module.exports = router;