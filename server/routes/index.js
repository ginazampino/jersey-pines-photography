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
                id: id
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

    app.post('/api/delete/:id', async function(req, res) {
        const id = req.params.id;

        try {
            await Images.destroy({
                where: {
                    id: id
                }
            });

            res.json({});
        } catch (err) {
            res.status(500).json({ err });
        }
    });

    app.post('/api/upload', async function(req, res) {
        // const data = req.body;

        const files = req.files;
        const file = files && files.file;

        if (req.body.id) {
            // Begin updating:

            const id = req.body.id;
            let image_url;

            if (file && file.name) {
                const url = path.join(config.uploadPath, file.name);

                file.mv(url, function(err) {
                    if (err) return res.status(500).send(err);
                });

                image_url = file.name;
            }

            try {
                await Images.update({
                    image_title: req.body.title,
                    image_url: image_url,
                    category_id: req.body.category,
                    image_date: req.body.date,
                    image_location: req.body.location,
                    image_note: req.body.note,
                    
                },
                {
                    where: {
                        id: id
                    }
                });

                res.json({ id });
            } catch (err) {
                res.status(500).json({ err });
            }
            
        } else {
            // Begin creating:

            if (!file) {
                return res.status(400).json({ err: 'A file must be uploaded' });
            }

            const url = path.join(config.uploadPath, file.name);

            file.mv(url, function(err) {
                if (err) return res.status(500).send(err);
            });

            const image = Images.build({
                image_title: req.body.title,
                image_url: file.name,
                category_id: req.body.category,
                image_date: req.body.date,
                image_location: req.body.location,
                image_note: req.body.note
            });

            try {
                await image.save();
                res.json({ id: image.id });
            } catch (err) {
                res.status(500).json({ err });
            }
        }
    });
};