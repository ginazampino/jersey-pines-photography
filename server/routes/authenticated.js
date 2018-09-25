const express = require('express');

module.exports = function createAuthenticatedRoutes() {
    const router = express.Router()

    router.post('/api/delete/:id', async function(req, res) {
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

    router.post('/api/upload', async function(req, res) {
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

    return router;
}