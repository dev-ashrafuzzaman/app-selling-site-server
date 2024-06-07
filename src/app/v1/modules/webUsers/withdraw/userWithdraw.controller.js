const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../../utils/currentDateTime');

exports.createWithdraw = async (req, res) => {
    const dhakaTime = await getCurrentDateTimeInDhaka();
    const formattedDhakaTime = formatDateTime(dhakaTime);

    const { withdraw,currency } = req.body;
    const db = getDatabase();
    const query = { _id: new ObjectId(withdraw.uid) }
    try {
        if (!dhakaTime) {
            return res.send({ Error: 'Failed to fetch Dhaka time' })
        }
        const user = await db.collection('users').findOne(query);
        const global = await db.collection('global').find().toArray();


        if (parseFloat(global[0]?.withdrawRules?.minAmount) > parseFloat(withdraw?.amount)) {
            return res.send({ Error: `Minimum Withdraw Amount ${global[0]?.withdrawRules?.minAmount}` });
        } else if (parseFloat(global[0]?.withdrawRules?.maxAmount) < parseFloat(withdraw?.amount)) {
            return res.send({ Error: `Maximum Withdraw Amount ${global[0]?.withdrawRules?.maxAmount}` });
        }

        if (parseFloat(global[0]?.withdrawRules?.minRef) > parseInt(user?.refBy.length)) {
            return res.send({ Error: `Minimum Refer Member ${global[0]?.withdrawRules?.minRef}` });
        }

        const totalWithdraw = parseFloat(withdraw?.amount) + parseFloat(global[0]?.withdrawRules?.outAmount)

        if (parseFloat(user?.balance) < totalWithdraw) {
            return res.send({ Error: `Your Balance is Low ${user?.balance}` });
        }

        const data = {
            withdrawNumber: withdraw.number,
            mathod: withdraw.method,
            uid: user.email,
            outAmount: parseFloat(withdraw.amount),
            status: "Pending",
            date: formattedDhakaTime,
            currency
        }

        const remainingBalance = parseFloat(user?.balance) - totalWithdraw;
        const result = await db.collection('withdraws').insertOne(data);
        const balanceUpdate = await db.collection('users').updateOne(query, { $set: { balance: parseFloat(remainingBalance).toFixed(4) } })
        res.send(result)
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getWithdraw = async (req, res) => {
    try {
        const db = getDatabase();
        const id = req.params.id;
        const query = { uid: id }
        const result = await db.collection('withdraws').find(query).sort({ date: -1 }).toArray();
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.setDailyCommission = async (req, res) => {
    const dhakaTime = await getCurrentDateTimeInDhaka();
    const formattedDhakaTime = formatDateTime(dhakaTime);

    try {
        const db = getDatabase();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const user = await db.collection('users').findOne(query);
        const global = await db.collection('global').find().toArray();
        const dailyCom = global[0].dailyCommission

        if (user.comStatus === false) {
            return res.send({ Error: `You have already claimed` });
        } else if (user.status === false) {
            return res.send({ Error: `Your account is blocked` });
        }
        const remainingBalance = parseFloat(user?.balance) + parseFloat(dailyCom);
        const result = await db.collection('users').updateOne(query, { $set: { balance: parseFloat(remainingBalance).toFixed(4), comStatus: false } })
        const userHis = {
            uid: user._id.toString(),
            type: `Daily-Commission`,
            amount: parseFloat(dailyCom),
            by: 'User',
            date: formattedDhakaTime,
            status: true
        }

        await db.collection('history').insertOne(userHis);
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
