const { getDatabase } = require("../../../../../utils/database");

const verifyWebUser = async (req, res, next) => {
    const db = getDatabase();
    const email = req.decoded.email;
    const query = { email: email }
    const user = await db.collection('users').findOne(query);

    if (!user || user.status !== true) {
        return res.status(403).send({ error: true, message: 'forbidden message' });
    }

    next();
};

module.exports = verifyWebUser;