const path = require('path');

module.exports = {
    mysql: {
        database: 'photosite',
        host: process.env.MYSQL_HOST || 'localhost',
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || ''
    },
    secret: process.env.SECRET_KEY || 'secret',
    server: {
        port: parseInt(process.env.HTTP_PORT || '8111')
    },
    uploadPath: process.env.UPLOAD_DIR || path.resolve(__dirname, '../wwwroot/uploads')
};