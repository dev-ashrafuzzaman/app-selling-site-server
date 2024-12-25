const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../../utils/currentDateTime');
const getBangladeshDateTime = require('../../../../../utils/currentDateTime');


exports.getWebJob = async (req, res) => {
    try {
        const db = getDatabase();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await db.collection('jobs').findOne(query);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.createUserJob = async (req, res) => {
  
    const { jobId } = req.body
    const db = getDatabase();
    const id = req.params.id;
    const vQuery = { _id: new ObjectId(jobId) }
    const jQuery = { uid: id, jobId }
    try {
        const visit = await db.collection('jobs').findOne(vQuery);
        if (visit.vacancy <= visit.attempt || visit.attempt < 0) {
            return res.send({ Error: `This task vacancy close` });
        }
        const totalVisit = parseInt(visit?.attempt) + parseInt(1)

        const jobCheck = await db.collection('jobSubmit').find(jQuery).toArray();
        if (jobCheck.length > 0) {
            return res.send({ Error: `Already completed this task` })
        }
        const result = await db.collection('jobSubmit').insertOne({ uid: id, jobId, visitTime: getBangladeshDateTime(), subTime1: '', prof1: '', subTime2: '', prof2: '', amount: visit.jobPrice , status: 'Pending' })
        await db.collection('jobs').updateOne(vQuery, { $set: { attempt: totalVisit } })
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateUserJobSemi = async (req, res) => {
    const { jobId, prof1, subTime1 } = req.body
    const db = getDatabase();
    const id = req.params.id;
    const jQuery = { uid: id, jobId }
    try {
        const result = await db.collection('jobSubmit').updateOne(jQuery, { $set: { prof1, subTime1: getBangladeshDateTime(), status: 'Semi-Submit' } })
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateUserJobFinal = async (req, res) => {
    const { jobId, prof2, subTime2 } = req.body
    const db = getDatabase();
    const id = req.params.id;
    const jQuery = { uid: id, jobId }
    try {
        const result = await db.collection('jobSubmit').updateOne(jQuery, { $set: { prof2, subTime2:getBangladeshDateTime() ,status: 'Submit'} })
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


