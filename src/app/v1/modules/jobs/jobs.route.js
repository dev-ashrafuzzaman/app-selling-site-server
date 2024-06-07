const express = require('express');
const jobController = require('./jobs.controller');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

router.post('/api/v1/admin/job',verifyJWT, verifyAdmin, jobController.createJob);
router.get('/api/v1/admin/jobs', verifyJWT,verifyAdmin, jobController.getJobs);
router.patch('/api/v1/admin/job/status/:id', verifyJWT , verifyAdmin, jobController.updateStatus);
router.delete('/api/v1/admin/job/:id', verifyJWT , verifyAdmin, jobController.deleteJob);

router.get('/api/v1/admin/jobs/submit', verifyJWT,verifyAdmin, jobController.getJobsSubmit);
router.patch('/api/v1/admin/job/status/:id', verifyJWT , verifyAdmin, jobController.updateStatus);

router.patch('/api/v1/admin/job/submit/status/:id', verifyJWT , verifyAdmin, jobController.updateJobSubmitStatus);
router.delete('/api/v1/admin/job/submit/:id', verifyJWT , verifyAdmin, jobController.deleteJobSubmit);
module.exports = router;