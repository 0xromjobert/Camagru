const bcrypt = require('bcrypt');
const {query} = require('../config/database');
const {generateJWT} = require('../middleware/tokenJWT');


const login = async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: 'All fields are required'});
    }
    try {
        const User = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (!User || User.rows.length === 0) {
            return res.status(400).json({message: 'Invalid Username'});
        }
        const user = User.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({message: 'Invalid Password'});
        }
        if (!user.is_confirmed) {
            return res.status(400).json({message: 'Please verify your email link before logging in'});
        }
        // Generate JWT
        const payload = {
            username: user.username,
            user_id: user.id,
            exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        }
        const token = generateJWT(payload);
        return res.status(200).json({message: 'Login successful', token: token});
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(400).json({message: error.message});
    }
}

module.exports = login;