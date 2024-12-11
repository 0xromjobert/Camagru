const {generateJWT} = require('../middleware/tokenJWT');
const bcrypt = require('bcrypt');
const {query} = require('../config/database');

const signup = async (req, res) => {
    // Validate input
    console.log("body is ", req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password){
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        // Check if the user or email already exists
        const existingUser = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existingUser && existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'A user already exists with your credentials' });
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
            exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        }
        const token = generateJWT(payload);

        // Mock email functionality
        console.log(`Mock email sent to ${email} with token: ${token}`);
        
        return res.status(201).json({ 
            message: 'User created successfully, check your email for verification', 
            token: token
         });
    }
    catch (error) {
        console.error('Error during signup:', error);
        res.status(400).json({ message: error.message });
    }
}


module.exports = signup;