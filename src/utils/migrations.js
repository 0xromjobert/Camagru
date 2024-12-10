const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function applyMigrations() {
    try {
        const migrations = await db.query("SELECT * FROM migrations");
        const appliedMigrations = migrations.rows.map(migration => migration.name);
        
        const migPath = path.join(__dirname, '../..', 'migrations');
        const migrationFiles = fs.readdirSync(migPath);

        for (const file of migrationFiles) {
            if (!appliedMigrations.includes(file)) {
                const filePath = path.join(migPath, file);
                const sql = fs.readFileSync(filePath, 'utf-8');
                await db.query(sql);
                await db.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
                console.log(`Applied migration: ${file}`);
            }
        }
        console.log('All migrations applied');
    }
    catch (error) {
        console.error('Error applying migrations:', error);
    }
}

module.exports = applyMigrations;