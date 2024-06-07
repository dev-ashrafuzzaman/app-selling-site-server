const express = require('express');
const webJobController = require('./webJob.controller');
const verifyJWT = require('../../webUsers/middleware/webVerifyJWT');
const verifyAdmin = require('../../webUsers/middleware/webVerifyUser');
const router = express.Router();


router.get('/api/v1/web/public/job/:id', webJobController.getWebJob);
router.post('/api/v1/web/user/job/claim/:id',verifyJWT, verifyAdmin, webJobController.createUserJob);
router.patch('/api/v1/web/user/job/semi-final/claim/:id',verifyJWT, verifyAdmin, webJobController.updateUserJobSemi);
router.patch('/api/v1/web/user/job/final/claim/:id',verifyJWT, verifyAdmin, webJobController.updateUserJobFinal);

module.exports = router;