const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../utils/currentDateTime');

exports.createJob = async (req, res) => {
  const dhakaTime = await getCurrentDateTimeInDhaka();
  const formattedDhakaTime = formatDateTime(dhakaTime);

  const { job } = req.body;
  const db = getDatabase();
  try {
    if (!dhakaTime) {
      return res.send({ Error: 'Failed to fetch Dhaka time' })
    }
    job.published = formattedDhakaTime;
    const result = await db.collection('jobs').insertOne(job);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getJobs = async (req, res) => {
    try {
      const { page = 1, pageSize = 10, search = '' } = req.query;
      const db = getDatabase();
      const query = {};
  
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
        ];
      }
  
      const totalCount = await db.collection('jobs').countDocuments(query);
      const result = await db.collection('jobs')
        .find(query)
        .sort({ published: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .toArray();
  
      res.json({ totalCount, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  exports.updateStatus = async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const { statusData } = req.body;
    const db = getDatabase();
    try {
      const result = await db.collection('jobs').updateOne(filter, { $set: statusData });
      res.send(result)
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  exports.deleteJob = async (req, res) => {
    const id = req.params.id;
    const db = getDatabase();
    const query = { _id: new ObjectId(id) };
    try {
      const result = await db.collection('jobs').deleteOne(query);
      res.send(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

  
  exports.getJobsSubmit = async (req, res) => {
    try {
      const { page = 1, pageSize = 10, search = '' } = req.query;
      const db = getDatabase();
      const query = {};
  
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
        ];
      }
  
      const totalCount = await db.collection('jobSubmit').countDocuments(query);
      const result = await db.collection('jobSubmit')
        .find(query).sort({ visitTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .toArray();
  
      res.json({ totalCount, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  exports.updateJobSubmitStatus = async (req, res) => {
    const dhakaTime = await getCurrentDateTimeInDhaka();
  const formattedDhakaTime = formatDateTime(dhakaTime);

    const id = req.params.id;
    const { statusValue, info, date } = req.body;
    const filter = { _id: new ObjectId(id) }
    const uquery = { _id: new ObjectId(info.uid) }
    const db = getDatabase();
    try {
      const user = await db.collection('users').findOne(uquery);
      const remainingBalance = parseFloat(user.balance) + parseFloat(info.amount);
  
      if (statusValue == 'Rejected') {
        const rejected = await db.collection('jobSubmit').deleteOne(filter);
        const userHis = {
          uid: user._id.toString(),
          type: `Job- ${statusValue}`,
          amount: parseFloat(0),
          by: 'Admin',
          date:formattedDhakaTime,
          status: false
        }

        await db.collection('history').insertOne(userHis);
        return res.send(rejected);
      }
  
      const userHis = {
        uid: user._id.toString(),
        type: `Job- ${statusValue}`,
        amount: parseFloat(info.amount),
        by: 'Admin',
        date:formattedDhakaTime,
        status: true
      }
      await db.collection('history').insertOne(userHis);
      await db.collection('users').updateOne(uquery, { $set: { balance: parseFloat(remainingBalance).toFixed(4) } });
      const result = await db.collection('jobSubmit').deleteOne(filter);
      res.send(result)
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  

  exports.deleteJobSubmit = async (req, res) => {
    const id = req.params.id;
    const db = getDatabase();
    const query = { _id: new ObjectId(id) };
    try {
      const result = await db.collection('jobSubmit').deleteOne(query);
      res.send(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  