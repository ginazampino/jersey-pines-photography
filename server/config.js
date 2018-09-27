const path = require('path');

module.exports = {
    mysql: {
        database: 'photosite',
        host: process.env.MYSQL_HOST || 'localhost',
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || ''
    },
    oauth: {
        authorizedEmails: [
            'jesse.colin.hallam@gmail.com',
            'zampino.gina@gmail.com'
        ],
        clientId: process.env.PHOTOSITE_OAUTH_CLIENT_ID,
        clientSecret: process.env.PHOTOSITE_OAUTH_CLIENT_SECRET,
        redirectUrl: process.env.PHOTOSITE_OAUTH_REDIRECT_URL
    },
    secret: process.env.SECRET_KEY || 'secret',
    server: {
        port: parseInt(process.env.HTTP_PORT || '8111')
    },
    uploadPath: process.env.UPLOAD_DIR || path.resolve(__dirname, '../wwwroot/uploads')
};