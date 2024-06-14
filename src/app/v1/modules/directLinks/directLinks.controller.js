const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../utils/currentDateTime');


exports.createDirect = async (req, res) => {
  const dhakaTime = await getCurrentDateTimeInDhaka();
  const formattedDhakaTime = formatDateTime(dhakaTime);

  const { direct } = req.body;
  const db = getDatabase();
  try {
    if (!dhakaTime) {
      return res.send({ Error: 'Failed to fetch Dhaka time' })
    }
    direct.published = formattedDhakaTime;
    const result = await db.collection('directlinks').insertOne(direct);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDirects = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await db.collection('directlinks').countDocuments(query);
    const result = await db.collection('directlinks')
      .find(query).sort({ published: -1 })
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
    const result = await db.collection('directlinks').updateOne(filter, { $set: statusData });
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteDirect = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection('directlinks').deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getDirectsSubmit = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await db.collection('directSubmit').countDocuments(query);
    const result = await db.collection('directSubmit')
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

exports.updateDirectSubmitStatus = async (req, res) => {
  const dhakaTime = await getCurrentDateTimeInDhaka();
  const formattedDhakaTime = formatDateTime(dhakaTime);

  const id = req.params.id;
  const { statusValue, info } = req.body;
  const filter = { _id: new ObjectId(id) }
  const uquery = { _id: new ObjectId(info.uid) }
  const db = getDatabase();
  try {
    const user = await db.collection('users').findOne(uquery);
    const remainingBalance = parseInt(user.balance) + parseInt(info.amount);

    if (statusValue == 'Rejected') {
      const rejected = await db.collection('directSubmit').deleteOne(filter);
      const userHis = {
        uid: user._id.toString(),
        type: `Direct-Link- ${statusValue}`,
        amount: parseInt(0),
        by: 'Admin',
        date: formattedDhakaTime,
        status: false
      }

      await db.collection('history').insertOne(userHis);
      return res.send(rejected);
    }

    const userHis = {
      uid: user._id.toString(),
      type: `Direct-Link- ${statusValue}`,
      amount: parseInt(info.amount),
      by: 'Admin',
      date: formattedDhakaTime,
      status: true
    }
    await db.collection('history').insertOne(userHis);
    await db.collection('users').updateOne(uquery, { $set: { balance: parseInt(remainingBalance) } });
    const result = await db.collection('directSubmit').deleteOne(filter);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.deleteDirectSubmit = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection('directSubmit').deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
