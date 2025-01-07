const {query} = require('../config/database');

async function getUserById(userId){
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
}

async function getUserByField(field, value){
    const result = await query(`SELECT * FROM users WHERE ${field} = $1`, [value]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
}

async function setUserFieldById(userId, field, value){
    //perform the update
    await query(`UPDATE users SET ${field} = $1 WHERE id = $2`, [value, userId]);

    // Fetch and return the updated user
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return null;
    if (result.rows[0][field] === value)
        return true
    return false;
}

module.exports = {getUserById, getUserByField, setUserFieldById};