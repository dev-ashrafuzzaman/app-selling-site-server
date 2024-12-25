
const moment = require('moment-timezone');

function getBangladeshDateTime() {
    return moment().tz("Asia/Dhaka").format('DD-MM-YYYY hh:mm:ss A');
}

module.exports = getBangladeshDateTime;