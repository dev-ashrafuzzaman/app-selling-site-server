const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');

exports.createPayment = async (req, res) => {
  const { payment } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('payments').insertOne(payment);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { paymentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await db.collection('payments').countDocuments(query);
    const result = await db.collection('payments')
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .toArray();

    res.json({ totalCount, data: result  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getPayment = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await db.collection('payments').findOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updatePayment = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const { payment } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('payments').updateOne(filter, { $set: payment });
    res.send(result)
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error no update' });
  }
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const { statusData } = req.body;
  console.log(statusData);
  const db = getDatabase();
  try {
    const result = await db.collection('payments').updateOne(filter, { $set: statusData });
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deletePayment = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection('payments').deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


