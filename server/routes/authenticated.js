const express = require('express');
const path = require('path');
const passport = require('passport');
const config = require('../config');
const { Categories, Images } = require('../db.js');

module.exports = function createAuthenticatedRoutes() {
    const router = express.Router()

    router.get('/auth/google/login', passport.authenticate('google', { scope: ['email', 'profile'] }));

    router.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/'
    }), function (req, res) {
        setTimeout(() => res.redirect('/admin'), 3000);
    });

    router.get('/auth/profile', function (req, res) {
        res.json(req.user);
    });

    router.use(createProtectedArea());
    return router;
}

function createProtectedArea() {
    const router = express.Router();

    function isLoggedIn(req, res, next) {
        if (req.user) return next();
        else res.redirect('/');
    }

    router.use(function (req, res, next) {
        console.log('>>> user =', req.user);
        next();
    });

    router.post('/api/delete/:id', isLoggedIn, async function(req, res) {
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

    router.post('/api/upload', isLoggedIn, async function(req, res) {
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