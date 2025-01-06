const { authToken } = require('../middleware/tokenJWT');
const {getUserById} = require('../models/User');
const express = require('express');

const router = express.Router();

router.get('/userinfo', authToken, async (req, res) => {
    try {
        const userid = req.user.user_id;
        const user = await getUserById(userid);
        if (!user){
        return res.status(404).json({message:'user not found'});
        }
        const data = {
            'username': user.username,
            "email": user.email,
            "created_at": user.created_at,
        }
        res.json(data); // Return the user data
    }
    catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 