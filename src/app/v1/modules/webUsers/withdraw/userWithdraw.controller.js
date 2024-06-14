const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../../utils/database');
const { getCurrentDateTimeInDhaka, formatDateTime } = require('../../../../../utils/currentDateTime');

exports.createWithdraw = async (req, res) => {
    const dhakaTime = await getCurrentDateTimeInDhaka();
    const formattedDhakaTime = formatDateTime(dhakaTime);

    const { withdraw } = req.body;
    const db = getDatabase();
    const query = { _id: new ObjectId(withdraw.uid) }
    try {
        if (!dhakaTime) {
            return res.send({ Error: 'Failed to fetch Dhaka time' })
        }
        const user = await db.collection('users').findOne(query);
        const global = await db.collection('utils').find().toArray();


        if (parseInt(global[0]?.withdrawRules?.minAmount) > parseInt(withdraw?.amount)) {
            return res.send({ Error: `Minimum Withdraw Amount ${global[0]?.withdrawRules?.minAmount}` });
        } else if (parseInt(global[0]?.withdrawRules?.maxAmount) < parseInt(withdraw?.amount)) {
            return res.send({ Error: `Maximum Withdraw Amount ${global[0]?.withdrawRules?.maxAmount}` });
        }

        if (parseInt(global[0]?.withdrawRules?.minRef) > parseInt(user?.refBy.length)) {
            return res.send({ Error: `Minimum Refer Member ${global[0]?.withdrawRules?.minRef}` });
        }

        const totalWithdraw = parseInt(withdraw?.amount) + parseInt(global[0]?.withdrawRules?.outAmount)

        if (parseInt(user?.balance) < totalWithdraw) {
            return res.send({ Error: `Your Balance is Low ${user?.balance}` });
        }

        const data = {
            withdrawNumber: withdraw.number,
            mathod: withdraw.method,
            uid: user.email,
            outAmount: parseInt(withdraw.amount),
            status: "Pending",
            date: formattedDhakaTime,
            currency: withdraw.currency
        }

        const remainingBalance = parseInt(user?.balance) - totalWithdraw;
        const result = await db.collection('withdraws').insertOne(data);
        const balanceUpdate = await db.collection('users').updateOne(query, { $set: { balance: parseInt(remainingBalance) } })
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
        const global = await db.collection('utils').find().toArray();
        const dailyCom = global[0].dailyCommission

        if (user.comStatus === false) {
            return res.send({ Error: `You have already claimed` });
        } else if (user.status === false) {
            return res.send({ Error: `Your account is blocked` });
        }
        const remainingBalance = parseInt(user?.balance) + parseInt(dailyCom);
        const result = await db.collection('users').updateOne(query, { $set: { balance: parseInt(remainingBalance), comStatus: false } })
        const userHis = {
            uid: user._id.toString(),
            type: `Daily-Commission`,
            amount: parseInt(dailyCom),
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
