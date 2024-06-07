const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');

exports.createpackage = async (req, res) => {
  const { package } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('packages').insertOne(package);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getpackages = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const db = getDatabase();
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await db.collection('packages').countDocuments(query);
    const result = await db.collection('packages')
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


exports.getpackage = async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await db.collection('packages').findOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updatepackage = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const { package } = req.body;
  const db = getDatabase();
  try {
    const result = await db.collection('packages').updateOne(filter, { $set: package });
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
    const result = await db.collection('packages').updateOne(filter, { $set: statusData });
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deletepackage = async (req, res) => {
  const id = req.params.id;
  const db = getDatabase();
  const query = { _id: new ObjectId(id) };
  try {
    const result = await db.collection('packages').deleteOne(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


