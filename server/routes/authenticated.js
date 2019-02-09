const express = require('express');
const path = require('path');
const passport = require('passport');
const config = require('../config');
const { Categories, Images } = require('../db.js');

const ERR_BAD_REQUEST = 400;

module.exports = function createAuthenticatedRoutes() {
    const router = express.Router()

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
    const backchannel = passport.authenticate(
        'google',
        { failureRedirect: '/' });
    router.get('/auth/google/callback', backchannel,
        (req, res) => {
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

    router.use(authenticate);

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
                res.status(500).json({ err });
            }
        };
    };

    /*
     *  Delete image route:
     *  - Deletes an image by its ID.
     *  - Authentication required.
     */
    router.post('/api/delete/:id', safeExecute(async (req, res) => {
        const id = req.params.id

        if (!id) return res
            .status(ERR_BAD_REQUEST)
            .json({ err: 'id is required.' });

        await Images.destroy({
            where: { id }
        });

        res.json({ });
    }));

    /*
     *  Upload image route:
     *  - Uploads an image.
     *  - Authentication required.
     */
    router.post('/api/upload', safeExecute(async (req, res) => {
        /* Extract the files out of the multipart request: */
        const files = req.files;
        
        /* Get the first file, if it exists: */
        const file = files && files.file;

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
                /* Move the file from the temporary dir to the
                   permanent upload dir. */
                await uploadFileAsync();
                update.image_url = file.name;
            }

            const id = req.body.id;
            const where = {
                where: { id }
            };
            await Images.update(update, where);
            res.json({ id });
        } else {
            /* This is a create operation: */
            
            /* A file is required for creates: */
            if (!file) {
                return res
                    .status(ERR_BAD_REQUEST)
                    .json({ err: 'A file must be uploaded.' });
            }

            /* Move the file from the temporary dir to the
               permanent upload dir. */
            await uploadFileAsync(file);

            const image = Images.build({
                image_title: req.body.title,
                image_url: file.name,
                category_id: req.body.category,
                image_date: req.body.date,
                image_location: req.body.location,
                image_note: req.body.note
            });

            await image.save();
            res.json({ id: image.id });
        }
    }));

    return router;
}

/**
 * Moves a file asynchronously.
 * @param file The multipart file to move.
 * @param path The absolute path to move to.
 */
const moveFileAsync = (file, path) => {
    return new Promise((resolve, reject) => {
        file.mv(path, err => {
            if (err) reject(err);
            else resolve(true);
        });
    });
};

/**
 * Moves a file to the upload directory asynchronously.
 * @param file The multipart file to upload.
 */
const uploadFileAsync = async (file) => {
    const outputFileName = path.join(config.uploadPath, file.name);
    await moveFileAsync(file, outputFileName);
};