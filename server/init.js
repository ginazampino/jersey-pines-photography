const db = require('./db');
const config = require('./config');

const fs = require('fs');
const path = require('path');

const sqlFile = path.resolve(__dirname, '../photography.sql');

module.exports = function() {
    db.connect.then(db => {
        db.query(
            `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${config.mysql.database}'`,
            { type: 'SELECT' }
        )
        .then(([row]) => {
            if (!row.count) {
                const script = fs.readFileSync(sqlFile).toString('utf8');
                db.query(script);
            }
        })
        .catch(console.error);
    })
}
