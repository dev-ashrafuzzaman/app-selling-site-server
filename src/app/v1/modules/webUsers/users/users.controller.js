const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../../utils/database');
const { generateReferCode, generateUserUit } = require('./users.utils');
const bcrypt = require('bcryptjs');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../../utils/currentDateTime');


exports.webUtils = async (req , res) => {
    const db = getDatabase();
    const query = { _id: new ObjectId('6651642f2be2c4bd602776a4') }
    const result = await db.collection('utils').findOne(query);
    const categorys = await db.collection('categories').find().toArray();
    const products = await db.collection('products').find().limit(20).toArray();
    res.send({result,categorys,products});
}

exports.getWebProduct = async (req, res) => {
    try {
        const db = getDatabase();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await db.collection('products').findOne(query);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.webAllUsers = async (req , res) => {
    const db = getDatabase();
    const user = await db.collection('users').find({ balance: {$gt: '2'}  }).toArray()
    res.json({user})
}
exports.webUserLogin = async (req, res) => {
    const db = getDatabase();
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.json({ Error: 'Invalid email or password' });
    }
    if (!user.status) {
        return res.json({ Error: 'Account Blocked Contact Admin' });
    }

    const existingDevice = await db.collection('users').findOne({
        $and: [
            { email }
        ]
    });

    if (existingDevice) {
        res.json({ auth: true, email });
    } else {
        return res.json({ Error: 'This device is already associated. Contact Admin' });
    }
};


exports.webUserRegister = async (req, res) => {
    const dhakaTime = await getCurrentDateTimeInDhaka();
    const formattedDhakaTime = formatDateTime(dhakaTime);

    const db = getDatabase();
    const { name, email, password, phone } = req.body;



    const existingUser = await db.collection('users').findOne({ $or: [{ email }] });
    if (existingUser) {
        return res.json({ Error: 'User already exists' });
    }



    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await db.collection('users').insertOne({
        name, email, phone, password: hashedPassword,
        status: true, 
         joinDate: formattedDhakaTime
    });
    res.json({ result, auth: true });
};

exports.updatePassword = async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const { passValues } = req.body;
    const db = getDatabase();
    try {
        const user = await db.collection('users').findOne(filter);
        if (!user || !bcrypt.compareSync(passValues.oldPass, user.password)) {
            return res.send({ Error: 'Invalid password try again!' });
        }
        const hashedPassword = bcrypt.hashSync(passValues.newPass, 10);
        const result = await db.collection('users').updateOne(filter, { $set: { password: hashedPassword } })
        res.send(result)
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    const db = getDatabase();
    const query = { _id: new ObjectId(id) };
    try {
        const result = await db.collection('users').deleteOne(query);
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


