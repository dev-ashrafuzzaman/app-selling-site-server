const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../../../utils/database');
const axios = require('axios');

function getFormattedDate() {
    const currentDate = new Date();
    const amOrPm = currentDate.getHours() >= 12 ? 'pm' : 'am';
    const hours12Format = (currentDate.getHours() % 12) || 12; // Convert to 12-hour format
    const minutes = addLeadingZero(currentDate.getMinutes());
    const seconds = addLeadingZero(currentDate.getSeconds());

    const formattedDate = `${addLeadingZero(currentDate.getDate())}/${addLeadingZero(currentDate.getMonth() + 1)}/${currentDate.getFullYear()} ${hours12Format}:${minutes}:${seconds} ${amOrPm}`;

    return formattedDate;
}

function addLeadingZero(value) {
    return value < 10 ? `0${value}` : value;  
}


exports.initiatePayment = async (req, res) => {
    try {
        const { payInfo } = req.body;
        const { payType, sureName, mobile, userName, totalVts, billAmount, billCurrentYear ,billMonth , id} = payInfo;

        // Define payment details in a separate object for clarity
        const paymentDetails = {
            full_name: sureName,
            email:'bill@sgt.com',
            amount: billAmount,
            metadata: { userName, totalVts, billMonth, billCurrentYear,payType, mobile , id},
            redirect_url: process.env.redirect_url,
            cancel_url: 'http://dash.surokkhagps.com/tracking/app/userName', // Corrected typo in the URL
            webhook_url: 'string', // Update this to your actual webhook URL
            return_type: 'GET',
        };

        const headers = {
            'Content-Type': 'application/json',
            'RT-UDDOKTAPAY-API-KEY': process.env.API_KEY,
        };

        // Make the POST request to initiate the payment
        const uddoktaPayResponse = await axios.post(process.env.PAY_API_URL, paymentDetails, { headers });

        const responseData = uddoktaPayResponse.data;

        res.json({ data: responseData});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.verifyPayment = async (req, res) => {
    const db = getDatabase();
    try {
        if (req?.body?.invoice_id) {
            const query = { invoice_id: req?.body?.invoice_id }
            const alreadyPayment = await db.collection('bills').findOne(query);
            if (alreadyPayment) {
                return res.send({ message: 'Payment already exists' })
            }
         

            const externalApiResponse = await axios.post('https://pay.surokkhagps.com/api/verify-payment', req.body, {
                headers: {
                    accept: 'application/json',
                    'RT-UDDOKTAPAY-API-KEY': '5588e865c2a8c3cc109ecfe2e4b70f680ad7fa30',
                    'content-type': 'application/json',
                },
            });
            const billInsert = {
                billMonth: externalApiResponse.data.metadata.billMonth,
                id: externalApiResponse.data.metadata.id,
                sureName:externalApiResponse.data.full_name ,
                mobile: externalApiResponse.data.metadata.mobile,
                billAmount: parseInt(externalApiResponse.data.amount),
                userName: externalApiResponse.data.metadata.userName,
                billCurrentYear: externalApiResponse.data.metadata.billCurrentYear,
                billAdd: 'Auto',
                payType: externalApiResponse.data.metadata.payType,
                payDate: externalApiResponse.data.date,
                totalVts: externalApiResponse.data.metadata.totalVts,
                sender_number: externalApiResponse.data.sender_number,
                transaction_id: externalApiResponse.data.transaction_id,
                status: externalApiResponse.data.status,
                invoice_id: externalApiResponse.data.invoice_id,
                fee: parseInt(externalApiResponse.data.fee),
            }

            const savedData = await db.collection('bills').insertOne(billInsert);
            res.json({ data: externalApiResponse.data, savedData });
            
            const filter = { userName: externalApiResponse.data.metadata.userName };
            const updateStatus = {
                $set: {
                    billStatus: "Paid"
                }
            }
            const billStatusresult = await db.collection('users').updateOne(filter, updateStatus);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

