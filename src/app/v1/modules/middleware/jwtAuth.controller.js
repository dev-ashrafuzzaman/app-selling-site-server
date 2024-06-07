const { getDatabase } = require('../../../../utils/database');
require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.generateToken = (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
    res.send({ token });
};

exports.checkSuperAdmin = async(req, res) => {
    const email = req.params.email;
    const db = getDatabase();
    if (req.decoded.email !== email) {
        res.send({ admin: false })
    }

    const query = { email: email }
    const user = await db.collection('admins').findOne(query);
    const result = { admin: user?.role === 'admin' && user?.status === true }
    res.send(result);
};