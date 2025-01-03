const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');


exports.getGlobalData = async (req, res) => {
    try {
      const db = getDatabase();
      const global = await db.collection('utils').find().toArray();
    const result = global[0]
      res.send({ result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


exports.updateGlobalData = async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const { data } = req.body;
    const db = getDatabase();
    try {
      const result = await db.collection('utils').updateOne(filter, { $set: data });
      res.send(result)
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error no update' });
    }
  };

exports.updatePaymentEdit = async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const { payment } = req.body;
    const db = getDatabase();
    try {
      const result = await db.collection('utils').updateOne(filter, { $set: {paymentMathod: payment} });
      res.send(result)
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error no update' });
    }
  };