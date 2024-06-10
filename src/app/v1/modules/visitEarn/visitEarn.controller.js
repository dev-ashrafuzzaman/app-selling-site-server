const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../utils/currentDateTime');

exports.createBanner = async (req, res) => {
    const { banner } = req.body;
    const db = getDatabase();
    const objectId = new ObjectId('6601636366272fb46572a63e'); // Replace with your actual object ID

    // Generate a new ObjectId for the banner
    const bannerWithId = {
        _id: new ObjectId(),
        ...banner,
    };

    try {
        const result = await db.collection('utils').updateOne(
            { _id: objectId },
            { $push: { banner: bannerWithId } } // Ensure the correct field name; used `banners` as an example
        );

        if (result.modifiedCount > 0) {
            res.send({ message: 'Banner added successfully', result });
        } else {
            res.status(404).json({ error: 'Document not found or no modification made' });
        }
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

        const totalCount = await db.collection('utils').countDocuments(query);
        const result = await db.collection('utils')
            .find(query).sort({ published: -1 })
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize))
            .toArray();

        res.json({ totalCount, data: result[0].banner });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.updateStatus = async (req, res) => {
    const id = req.params.id; // This is the ID of the specific banner within the array
    const parentId = '6601636366272fb46572a63e'; // The ID of the parent document
    const filter = { _id: new ObjectId(parentId) };
    const {statusData} = req.body;
    const db = getDatabase();
    try {
        const result = await db.collection('utils').updateOne(
            filter,
            { $set: { 'banner.$[elem].status': statusData.status } },
            { arrayFilters: [{ 'elem._id': new ObjectId(id) }] }
        );

        if (result.modifiedCount > 0) {
            res.send(result);
        } else {
            res.status(404).json({ error: 'Document or banner not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteVisit = async (req, res) => {
    const bannerId = req.params.id; // The ID of the specific banner to be deleted
    const parentId = '6601636366272fb46572a63e'; // The ID of the parent document
    const filter = { _id: new ObjectId(parentId) };
    const db = getDatabase();

    try {
        const result = await db.collection('utils').updateOne(
            filter,
            { $pull: { banner: { _id: new ObjectId(bannerId) } } }
        );

        if (result.modifiedCount > 0) {
            res.send(result);
        } else {
            res.status(404).json({ error: 'Document or banner not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



