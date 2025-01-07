const {generateJWT, verifyJWT} = require('../middleware/tokenJWT');
const bcrypt = require('bcrypt');
const {query} = require('../config/database');
const {sendEmail} = require('./emailHelper');

const signup = async (req, res) => {
    // Validate input
    console.log("body is ", req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password){
        return res.status(401).json({ message: 'All fields are required' });
    }
    try {
        // Check if the user or email already exists
        const existingUser = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existingUser && existingUser.rows.length > 0) {
            return res.status(401).json({ message: 'A user already exists with your credentials' });
        }

        //hash passwrod then insert the new user into the database
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const user = await query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashPassword]);
        if (!user) {
            return res.status(500).json({ message: 'An error occurred while creating your account' });
        }
        const userId = user.rows[0].id;
        
        // Generate JWT
        const payload = {
            username : username,
            user_id : userId,
            purpose : 'email_verification',
            exp: Math.floor(Date.now() / 1000) + 60*60*24, // Expires in 24 hours
        }
        const token = generateJWT(payload);

        sendVerificationEmail(email, username, token);
        
        return res.status(201).json({ 
            message: `Your account was created successfully ${username}, check your email for verification`, 
            token: token
         });
    }
    catch (error) {
        console.error('Error during signup:', error);
        res.status(401).json({ message: error.message });
    }
}

function sendVerificationEmail(emailAddr, username, token) {
    // Mock email functionality
    const emailContent = `Hi ${username}, Click the link to verify your email: http://localhost:3000/api/auth/verify?token=${token}`;
    sendEmail(emailAddr, 'Email Verification Camagru', emailContent);
}

async function verifyEmailToken(linkToken) {
    const payload = verifyJWT(linkToken);
    if (!payload || payload.purpose !== 'email_verification') {
        return false;
    }
    // Update user in database to verified
    const userId = payload.user_id;
    const user = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user || user.rows.length === 0)
        return false;
    const q = await query('UPDATE users SET is_confirmed = true WHERE id = $1 RETURNING *', [userId]);
    if (!q || q.rows.length === 0)
        return false;
    return true;
}


module.exports = {signup, verifyEmailToken};