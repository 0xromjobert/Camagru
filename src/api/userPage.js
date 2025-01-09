const { authToken } = require('../middleware/tokenJWT');
const {validateDynamic} = require('../middleware/authValidator');
const {getUserById} = require('../models/User');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');

const express = require('express');

const router = express.Router();
/*
Used in profile page to ajaxify the page (BONUS) and get fields [GET]
*/
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

/*
Used in profile to change the userfield [POST]
*/
router.post('/edit', authToken, validateDynamic, async (req, res) => {
    try {

        const {username, email, password} = req.body;
        
        // Collect only the provided fields
        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (password){
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            updates.password = hashPassword;
        }
 
         // Ensure at least one field is provided
         if (Object.keys(updates).length === 0) {
             return res.json({status: 'error', code: 400,message: "At least one field must be filled!"});
        }

        // Perform the update
        const updatedUser = await updateUserFields(req.user.user_id, updates);

        if (!updatedUser) {
            return res.status(200).json({ message: 'User not found or update failed.' });
        }
        res.status(200).json({
            message: 'User details updated successfully!',
            user: updatedUser,
        });
        
        
    }
    catch(error){
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

async function updateUserFields(userId, updates) {
    const fields = Object.keys(updates); // e.g., ['username', 'email', 'password']
    const values = Object.values(updates); // e.g., ['newUsername', 'newEmail', 'newPassword']

    if (fields.length === 0) return false; // No fields to update - INCASE protection

    // Build the dynamic SQL query
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    console.log("in EDIT PROFILE ENDPOINT the sql clause is", setClause);

    // Add a parameterized placeholder for userId
    const sql = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    console.log("and the QUERY is", sql);


    // Add the userId to the parameters
    const result = await query(sql, [...values, userId]);

    if (result.rows.length === 0) return null; // No user found with the given id
    return result.rows[0]; // Return the updated user object
}


module.exports = router; 