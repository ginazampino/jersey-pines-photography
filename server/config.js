const path = require('path');
require('dotenv').config();

module.exports = {
    mysql: {
        database: 'photosite',
        host: process.env.MYSQL_HOST || 'localhost',
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || ''
    },
    oauth: {
        authorizedEmails: ['jesse.colin.hallam@gmail.com', 'zampino.gina@gmail.com'],
        clientId: process.env.PHOTOSITE_OAUTH_CLIENT_ID,
        clientSecret: process.env.PHOTOSITE_OAUTH_CLIENT_SECRET,
        redirectUrl: process.env.PHOTOSITE_OAUTH_REDIRECT_URL
    },
    secret: process.env.SECRET_KEY || 'secret',
    server: {
        port: parseInt(process.env.HTTP_PORT || '8111')
    },
    storage: {
        accessKeyId: process.env.PHOTOSITE_STORAGE_ACCESSKEY,
        apiKey: process.env.PHOTOSITE_STORAGE_APIKEY,
        bucket: process.env.PHOTOSITE_STORAGE_BUCKET,
        edgeId: process.env.PHOTOSITE_STORAGE_EDGE_ID,
        edgeUri: process.env.PHOTOSITE_STORAGE_EDGEURI,
        endpoint: process.env.PHOTOSITE_STORAGE_ENDPOINT,
        rootPath: process.env.PHOTOSITE_STORAGE_ROOT,
        secretAccessKey: process.env.PHOTOSITE_STORAGE_SECRETKEY
    },
    uploadPath: process.env.UPLOAD_DIR || path.resolve(__dirname, '../wwwroot/uploads')
};
