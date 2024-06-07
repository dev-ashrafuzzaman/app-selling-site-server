const express = require('express');
const visitEarnController = require('./userVisitEarn.controller');
const verifyJWT = require('../middleware/webVerifyJWT');
const verifyAdmin = require('../middleware/webVerifyUser');
const router = express.Router();

router.get('/api/v1/web/user/visit-earn',verifyJWT, verifyAdmin, visitEarnController.getVisitEarns);
router.get('/api/v1/web/user/visit-earn/:id', visitEarnController.getVisitEarn);
router.patch('/api/v1/web/user/visit-earn/claim/:id',verifyJWT, verifyAdmin, visitEarnController.setVisitClaim);

// direct Link
router.get('/api/v1/web/user/direct-link/:id', visitEarnController.getDirectLink);
router.post('/api/v1/web/user/direct-link/claim/:id',verifyJWT, verifyAdmin, visitEarnController.createDirectLink);
router.patch('/api/v1/web/user/direct-link/final/claim/:id',verifyJWT, verifyAdmin, visitEarnController.updateDirectLink);

module.exports = router;