
exports.generateUserUit = (user) => {
    const jwt = require('jsonwebtoken');
    const uit = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' })
    return uit
};


exports.generateReferCode = () => {
    // Generate a random 6-digit number
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    // Generate two random alphabetic characters
    const randomAlphabets = generateRandomAlphabets();
    // Concatenate the numbers and alphabets to form an 8-digit refer code
    const referCode = randomAlphabets + randomNumber.toString();
    return referCode;
}

function generateRandomAlphabets() {
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomAlphabets = '';
    for (let i = 0; i < 2; i++) {
        randomAlphabets += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
    }
    return randomAlphabets;
}
