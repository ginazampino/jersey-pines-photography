const path = require('path');
const { Categories, Images } = require('../db.js');

const config = require('../config');

module.exports = function (app) {
    const index = path.resolve(__dirname, '../../wwwroot/index.html');

    app.get('/', function (req, res) {
        res.sendFile(index);
    });

    app.get('/api/categories', function (req, res) {
        Categories.findAll({})
        .then(categories => res.json(categories))
    });

    app.get('/api/gallery/:galleryName', function(req, res) {
        const galleryName = req.params.galleryName;

        Images.findAll({
            raw: true,
            include: [{
                model: Categories,
                where: { category_name: galleryName }
                
            }]
        }).then(results => res.json(results));
    });

    app.get('/api/gallery/:galleryName/image/:id', function(req, res) {
        const id = req.params.id;

        Images.findOne({
            where: {
                id: id
            }
        }).then(image => res.send(image));
    });

    app.get('/api/images/:id', function(req, res) {
        const id = req.params.id;

        Images.findOne({
            where: {
                unique_id: id
            }
        }).then(image => res.send(image));
    });

    app.get('/api/browse', function(req, res) {
        Images.findAll({
            raw: true,
            order: [
                ['id', 'desc']
            ]
        }).then(images => res.json(images));
    });

    const createAuthenticatedRoutes = require('./authenticated');
    app.use(createAuthenticatedRoutes());
};