const { getDatabase } = require('../../../../utils/database');


const verifyAdmin = async (req, res, next) => {
    const db = getDatabase();
    const email = req.decoded.email;
    const query = { email: email }
    const user = await db.collection('admins').findOne(query);

    if (!user || user.role !== 'admin' || user.status !== true) {
        return res.status(403).send({ error: true, message: 'forbidden message' });
    }

    next();
};

module.exports = verifyAdmin;