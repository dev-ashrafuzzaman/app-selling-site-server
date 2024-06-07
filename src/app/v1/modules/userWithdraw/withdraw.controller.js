const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../utils/currentDateTime');

exports.createWithdraw = async (req, res) => {
  const { withdraw } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('withdraws').insertOne(withdraw);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getPendingWithdraws = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { withdrawName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    query.status = 'Pending'

    const totalCount = await db.collection('withdraws').countDocuments(query);
    const result = await db.collection('withdraws')
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();
    const global = await db.collection('global').find().toArray();
    const users = await db.collection('users').find().toArray();
    res.json({ totalCount, data: result, global: global[0], users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.getApprovedWithdraws = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { withdrawName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    query.status = 'Approved'

    const totalCount = await db.collection('withdraws').countDocuments(query);
    const result = await db.collection('withdraws')
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();
    const global = await db.collection('global').find().toArray();
    const users = await db.collection('users').find().toArray();
    res.json({ totalCount, data: result, global: global[0], users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getRejectedWithdraws = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { withdrawName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    query.status = 'Rejected'

    const totalCount = await db.collection('withdraws').countDocuments(query);
    const result = await db.collection('withdraws')
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    const global = await db.collection('global').find().toArray();
    const users = await db.collection('users').find().toArray();
    res.json({ totalCount, data: result, global: global[0], users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getWithdraw = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await db.collection('withdraws').findOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updateWithdraw = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const { withdraw } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('withdraws').updateOne(filter, { $set: withdraw });
    res.send(result)

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error no update' });
  }
};

exports.updateStatus = async (req, res) => {
  const dhakaTime = await getCurrentDateTimeInDhaka();
  const formattedDhakaTime = formatDateTime(dhakaTime);

  const id = req.params.id;
  const { statusValue, data, date } = req.body;
  const filter = { _id: new ObjectId(id) }
  const query = { email: data.uid }
  const db = getDatabase();
  try {
    const user = await db.collection('users').findOne(query);
    const remainingBalance = parseFloat(user.balance).toFixed(4) + parseFloat(data.outAmount).toFixed(4);

    if (statusValue == 'Rejected') {
      const rejected = await db.collection('users').updateOne(query, { $set: { balance: parseFloat(remainingBalance).toFixed(4) } });
      await db.collection('withdraws').updateOne(filter, { $set: { status: statusValue } });
      const userHis = {
        uid: user._id.toString(),
        type: `Withdraw- ${statusValue}`,
        amount: parseFloat(data?.outAmount).toFixed(4),
        by: 'Admin',
        date:formattedDhakaTime,
        status: false
      }
      await db.collection('history').insertOne(userHis);
      return res.send(rejected);
    }

    const userHis = {
      uid: user._id.toString(),
      type: `Withdraw- ${statusValue}`,
      amount: parseFloat(data?.outAmount).toFixed(4),
      by: 'Admin',
      date:formattedDhakaTime,
      status: true
    }
    await db.collection('history').insertOne(userHis);


    const result = await db.collection('withdraws').updateOne(filter, { $set: { status: statusValue } });
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteWithdraw = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection('withdraws').deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


