const { getDatabase } = require('../../../../utils/database');
const axios = require('axios');
require('dotenv').config();

exports.createOTP = async (req, res) => {
    const { mobile } = req.body;
    // Generate and send OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const message = `Your DactarLink OTP for verification is ${otp}`;
    const otpCreationTime = new Date();
    const db = getDatabase();

    const result = await db.collection('users').updateOne({ mobile }, { $set: { otp , otpCreationTime } }, { upsert: true });
    // Send SMS using GreenWeb API
    const greenwebsms = new URLSearchParams();
    greenwebsms.append('token', process.env.SMS_TOKEN);
    greenwebsms.append('to', mobile);
    greenwebsms.append('message', message);


    try {
        const result = await axios.post('http://api.greenweb.com.bd/api.php', greenwebsms);
        res.send({ success: true, message: 'Successfull Send OTP' })
    } catch (err) {
        console.error('Error sending SMS:', err);
        res.json({ success: false, message: 'Error sending OTP' });
    }
};
exports.verifyOTP = async (req, res) => {
    const { mobile, otp } = req.body;
    const db = getDatabase();

    const result = await db.collection('users').findOne({ mobile });


    if (result.mobile == mobile && result.otp == otp) {
        const otpCreationTime = result.otpCreationTime;
    
        // Check if OTP is still valid (within 3 minutes)
        const currentTime = new Date();
        const timeDifference = (currentTime - otpCreationTime) / 1000; // Convert to seconds
    
        if (timeDifference <= 180 ) { // 180 seconds = 3 minutes
          await db.collection('users').updateOne({ mobile }, { $unset: { otp: 1 , otpCreationTime: 1}, $set: { reg: true } });
          res.send({message: 'OTP verified successfully'});
        } else {
          // OTP has expired
          res.send({message: 'OTP has expired'});
        }
      } else {
        // Invalid OTP
        res.send({message: 'Invalid OTP'});
      }


};