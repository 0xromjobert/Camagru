const bcrypt = require('bcrypt');
const {query} = require('../config/database');
const {generateJWT, verifyJWT} = require('../middleware/tokenJWT');
const {sendEmail} = require('./emailHelper');
const {getUserByField} = require("../models/User");


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
        res.cookie('authToken', token, {
            httpOnly:true,
            sameSite: 'Strict',
            secure:false, //to allow http
        });
        return res.status(200).json({message: 'Login successful', token: token});
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(400).json({message: error.message});
    }
}

async function askResetPassword(req, res) {
    // Implement password reset functionality here
    try {
        if (!req.body.email) {
            return res.status(400).json({message: 'Email is required'});
        };
        const user = await query('SELECT * FROM users WHERE email = $1', [req.body.email]);
        if (!user || user.rows.length === 0) {
            return res.status(400).json({message: 'No user found with that email'});
        }
        const payload = {
            email: req.body.email,
            purpose: 'password_reset',
            exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
         };
        const token = generateJWT(payload);
        sendResetEmail(req.body.email, token);
        res.status(200).json({message: 'Password reset link sent to email'});
    }catch (error) {
        console.error('Error during password reset:', error);
        res.status(400).json({message: error.message});
    }
}

async function resetPassword(req, res) {
    try {
        if (!req.user) //coming from middleware authToken
            return res.status(401).json({message: 'Unauthorized'});
        console.log('in reset pwd POST body is',req.body);
        if (!req.body.password || !req.body.confirmPassword) {
            return res.status(400).json({message: 'All fields are required'});
        }
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({message: 'Passwords do not match'});
        }
        console.log('in resetPwd POST API WE have user as', req.user);
        const user = await query('SELECT * FROM users WHERE id = $1', [req.user.user_id]);
        if (!user || user.rows.length === 0) {
            return res.status(404).json({message: 'User not found'});
        }
        console.log('User:', user.rows[0]);
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        console.log('password:', hashPassword);
        await query('UPDATE users SET password = $1 WHERE id = $2', [hashPassword, user.rows[0].id]);
        res.status(200).json({message: 'Password reset successful'});
    }catch (error) {
        console.error('Error during password reset:', error);
        res.status(400).json({message: error.message});
    }
}

function sendResetEmail(emailAddr, token) {
    //real-email sendign to a formpage with toke
    //const emailContent = `Click the link to reset your password: http://localhost:3000/auth/reset-page?token=${token}`;
    // Mock email functionality
    const emailContent = `Click the link to reset your password: http://localhost:3000/api/auth/reset-password?token=${token}`;
    sendEmail(emailAddr, 'Password Reset Camagru', emailContent);
}

async function verifyResetToken(linkToken) {
    const payload = verifyJWT(linkToken);
    console.log('in verify reset token pauload', payload);
    if (!payload || payload.purpose !== 'password_reset') {
        return { status: false, message: 'Invalid or expired token' };
    }
    const user = await getUserByField('email',payload.email);
    if (!user) {
        return { status: false, message: 'User not found' };
    }
    // Generate JWT
    const authPayload = {
        username: user.username,
        user_id: user.id,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    }
    const token = generateJWT(authPayload);
    return { status: true, token:token };
}

module.exports = {login, verifyResetToken, askResetPassword, resetPassword};