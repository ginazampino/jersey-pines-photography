const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

module.exports = function (app) {
    const wwwroot = path.resolve(__dirname, '../../wwwroot');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(fileUpload());

    require('../routes')(app);

    app.use(history());
    app.use(express.static(wwwroot));
};