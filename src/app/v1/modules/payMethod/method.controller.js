const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');

exports.createmethod = async (req, res) => {
  const { method } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('methods').insertOne(method);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getmethods = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { methodName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await db.collection('methods').countDocuments(query);
    const result = await db.collection('methods')
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


exports.getmethod = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await db.collection('methods').findOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updatemethod = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const { method } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('methods').updateOne(filter, { $set: method });
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
    const result = await db.collection('methods').updateOne(filter, { $set: statusData });
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deletemethod = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection('methods').deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


