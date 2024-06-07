const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../utils/currentDateTime');

exports.createVisit = async (req, res) => {
    const dhakaTime = await getCurrentDateTimeInDhaka();
    const formattedDhakaTime = formatDateTime(dhakaTime);
    
    const { visit } = req.body;
    const db = getDatabase();
    try {
        if (!dhakaTime) {
            return res.send({ Error: 'Failed to fetch Dhaka time' })
        }
        visit.published = formattedDhakaTime;
        const result = await db.collection('visitearns').insertOne(visit);
        res.send(result)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getVisits = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search = '' } = req.query;
        const db = getDatabase();
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
            ];
        }

        const totalCount = await db.collection('visitearns').countDocuments(query);
        const result = await db.collection('visitearns')
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
        const result = await db.collection('visitearns').updateOne(filter, { $set: statusData });
        res.send(result)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteVisit = async (req, res) => {
    const id = req.params.id;
    const db = getDatabase();
    const query = { _id: new ObjectId(id) };
    try {
        const result = await db.collection('visitearns').deleteOne(query);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



