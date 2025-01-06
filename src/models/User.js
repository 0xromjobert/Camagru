const {query} = require('../config/database');

async function getUserById(userId){
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
}

module.exports = {getUserById};