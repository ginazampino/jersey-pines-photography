const path = require('path');

module.exports = {
    secret: process.env.SECRET_KEY || 'secret',
    server: {
        port: parseInt(process.env.HTTP_PORT || '8111')
    },
    uploadPath: process.env.UPLOAD_DIR || path.resolve(__dirname, '../wwwroot/uploads')
};