const express = require('express');
const app = express();
const config = require('./config');

require('./middleware')(app);

app.listen(config.server.port, function () {
    console.log('Now listening on port ' + config.server.port + '.');
});