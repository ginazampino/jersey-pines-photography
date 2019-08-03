const axios = require('axios');
const express = require('express');
const path = require('path');
const passport = require('passport');
const config = require('../config');
const { Categories, Images, ImageExifs } = require('../db.js');

const uuidV4 = require('uuid/v4');

const ERR_BAD_REQUEST = 400;

module.exports = function createAuthenticatedRoutes() {
    const router = express.Router();

    /*
     *  Passport.js authentication route:
     *  - Redirects the user agent to the OAuth 2.0 challenge screen.
     */
    const challenge = passport.authenticate('google', {
        scope: ['email', 'profile']
    });
    router.get('/auth/google/login', challenge);

    /*
     *  Passport.js authentication callback route:
     *  - Receives OAuth 2.0 redirect and performs backchannel auth.
     */
    const backchannel = passport.authenticate('google', { failureRedirect: '/' });
    router.get('/auth/google/callback', backchannel, (req, res) => {
        /* 
                Redirecting immediately to the authenticated section
                will cause the page to occasionally load before the
                express session driver has stored the user token.
                
                Set timeout is a dirty, temporary hack to get around
                this.

                I should probably change out the session handler for
                a more reliable alternative in the future.
            */
        setTimeout(() => res.redirect('/admin'), 3000);
    });

    /*
     *  User profile route:
     *  - Returns the user token for the currently signed in user.
     *  - This route is not authenticated so anonymous users will
     *    get a "null" response instead of being redirected.
     */
    router.get('/auth/profile', (req, res) => {
        res.json(req.user);
    });

    /*
     *  Authenticate middleware:
     *  - Requires that following routes have an valid user token.
     */
    const authenticate = (req, res, next) => {
        if (req.user) next();
        else res.redirect('/');
    };

    /*
     *  Safe execution guard:
     *  - Generates an express-compatible route handler which
     *    safely executes the workload.
     *  - In the event of an exception (or rejected Promise),
     *    the safe execution guard reports the error on the
     *    API response.
     */
    const safeExecute = callback => {
        return async (req, res, ...theRest) => {
            try {
                const result = callback(req, res, ...theRest);
                if (result && typeof result.then === 'function') {
                    await result;
                }
            } catch (err) {
                console.error(err);
                res.status(500).json({ err: err.message });
            }
        };
    };

    /*
     *  Delete image route:
     *  - Deletes an image by its ID.
     *  - Authentication required.
     */
    router.post(
        '/api/delete/:id',
        authenticate,
        safeExecute(async (req, res) => {
            const id = req.params.id;

            if (!id) return res.status(ERR_BAD_REQUEST).json({ err: 'id is required.' });

            await Images.destroy({
                where: { unique_id: id }
            });

            res.json({});
        })
    );

    /*
     *  Upload image route:
     *  - Uploads an image.
     *  - Authentication required.
     */
    router.post(
        '/api/upload',
        authenticate,
        safeExecute(async (req, res) => {
            /* Extract the files out of the multipart request: */
            const files = req.files;

            /* Get the first file, if it exists: */
            const file = files && files.file;

            const exif = require('./exif');
            const upload = require('./upload');

            /* If "id" is passed on the body, this is an update operation: */
            if (req.body.id) {
                /* This is an update operation: */
                const update = {
                    image_title: req.body.title,
                    category_id: req.body.category,
                    image_date: req.body.date,
                    image_location: req.body.location,
                    image_note: req.body.note
                };

                /* Determine if a new image is replacing the previous image: */
                if (file && file.name) {
                    await upload(req.body.id, file.data);
                    await upload.clearCache(req.body.id);

                    const exifData = await exif(file.data);
                    await createOrUpdateExifData(await getImageIdByUniqueId(req.body.id), exifData);
                }

                const id = req.body.id;
                const where = {
                    where: { unique_id: id }
                };
                await Images.update(update, where);

                res.json({ id });
            } else {
                /* This is a create operation: */

                /*
                    Generate a unique identifier to refer to
                    this image, since it doesn't have a primary
                    key yet. 
                */
                const guid = uuidV4();

                /* A file is required for creates: */
                if (!file) {
                    return res.status(ERR_BAD_REQUEST).json({ err: 'A file must be uploaded.' });
                }

                await upload(guid, file.data);

                const image = Images.build({
                    unique_id: guid,
                    image_title: req.body.title,
                    image_url: file.name,
                    category_id: req.body.category,
                    image_date: req.body.date,
                    image_location: req.body.location,
                    image_note: req.body.note,
                    image_url: `${config.storage.edgeUri}/${config.storage.rootPath}/${guid}`
                });

                await image.save();

                const exifData = await exif(file.data);
                await createOrUpdateExifData(image.id, exifData);

                res.json({ id: guid });
            }
        })
    );

    return router;
};

async function createOrUpdateExifData(imageId, exifData) {
    await ImageExifs.destroy({
        where: {
            image_id: imageId
        }
    });
    const promises = Object.keys(exifData).map(async key =>
        ImageExifs.build({
            image_id: imageId,
            exif_key: key,
            exif_value: JSON.stringify(exifData[key]) || 'null'
        }).save()
    );
    await Promise.all(promises);
}

async function getImageIdByUniqueId(uniqueId) {
    const image = await Images.findOne({
        where: {
            unique_id: uniqueId
        }
    });
    return image && image.id;
}
