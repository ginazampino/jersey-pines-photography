const path = require('path');
const { Categories, Images, ImageExifs, sequelize } = require('../db.js');
const { Op } = require('sequelize');

const config = require('../config');

module.exports = function(app) {
    const index = path.resolve(__dirname, '../../wwwroot/index.html');

    app.get('/', function(req, res) {
        res.sendFile(index);
    });

    app.get('/api/categories', function(req, res) {
        Categories.findAll({}).then(categories => res.json(categories));
    });

    app.get('/api/random-image', function(req, res) {
        let last_image = req.query.last_image || '';
        last_image = last_image.replace(/[^\d]/g, '');
        if (!last_image) last_image = '-1';
        const sql = `
            SELECT      *
            FROM        images
            WHERE       id <> ${last_image}
            ORDER BY    RAND()
            LIMIT       1;
        `;

        sequelize.query(sql, { model: Images }).then(results => res.json(results));
    });

    app.get('/api/gallery/:galleryName', function(req, res) {
        const galleryName = req.params.galleryName;

        Images.findAll({
            raw: true,
            include: [
                {
                    model: Categories,
                    where: { category_name: galleryName }
                }
            ]
        }).then(results => res.json(results));
    });

    app.get('/api/gallery/:galleryName/image/:id', function(req, res) {
        const id = req.params.id;

        Images.findOne({
            raw: true,
            where: {
                id: id
            }
        })
            .then(async image => {
                const exifRows = await ImageExifs.findAll({
                    where: {
                        image_id: image.id,
                        exif_key: {
                            [Op.not]: 'source_data'
                        }
                    }
                });
                image.exif = exifRows.reduce((total, next) => {
                    total[next.exif_key] = JSON.parse(next.exif_value);
                    return total;
                }, {});
                return image;
            })
            .then(image => res.send(image));
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
            order: [['id', 'desc']]
        }).then(images => res.json(images));
    });

    const createAuthenticatedRoutes = require('./authenticated');
    app.use(createAuthenticatedRoutes());
};
