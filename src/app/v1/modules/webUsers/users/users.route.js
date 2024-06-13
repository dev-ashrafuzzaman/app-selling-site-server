const express = require('express');
const userController = require('./users.controller');
const verifyJWT = require('../../webUsers/middleware/webVerifyJWT');
const verifyAdmin = require('../../webUsers/middleware/webVerifyUser');
const router = express.Router();

router.get('/api/v1/web/user/order/:id',  userController.getWebOrder);
router.get('/api/v1/web/products',  userController.getWebProducts);
router.get('/api/v1/web/utils',  userController.webUtils);

router.get('/api/v1/web/user',  userController.webAllUsers);
router.post('/api/v1/web/user/login',  userController.webUserLogin);
router.post('/api/v1/web/user/register',userController.webUserRegister);
router.post('/api/v1/web/user/checkout',verifyJWT,verifyAdmin,userController.webOrder);
router.patch('/api/v1/web/user/password-change/:id',verifyJWT,verifyAdmin, userController.updatePassword);
router.patch('/api/v1/admin/user/reseller/:id',verifyJWT,verifyAdmin, userController.updateApplyReseller);

router.get('/api/v1/web/public/product/:id',userController.getWebProduct);
module.exports = router;