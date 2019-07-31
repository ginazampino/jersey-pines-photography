const axios = require('axios');
const S3Client = require('aws-sdk/clients/s3');
const fs = require('fs');
const sharp = require('sharp');

const config = require('../config');

const sizeProfiles = [
    { key: 'sm', width: 400, height: 400, quality: 60 },
    { key: 'md', width: 800, height: 800, quality: 65 },
    { key: 'lg', width: 1200, height: 1200, quality: 90 }
];

const s3 = new S3Client({
    credentials: {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey
    },
    endpoint: config.storage.endpoint
});

module.exports = function (id, buffer) {
    const promises = sizeProfiles.map(profile => uploadImage(id, buffer, profile));
    return Promise.all(promises);
};

module.exports.clearCache = async function (id) {
    await axios.delete(
        `https://api.digitalocean.com/v2/cdn/endpoints/${config.storage.edgeId}/cache`, 
        {
            data: JSON.stringify({
                files: [
                    `${config.storage.rootPath}/${id}/*`
                ]
            }),
            headers: {
                Authorization: `bearer ${config.storage.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
};

async function uploadImage(id, buffer, profile) {
    buffer = await sharp(buffer)
        .resize(profile.width, profile.height, { fit: 'inside' })
        .jpeg({ quality: profile.quality })
        .withMetadata()
        .toBuffer();

    const key = `${config.storage.rootPath}/${id}/${profile.key.toLowerCase()}.jpg`;
    const req = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: config.storage.bucket,
        ContentType: 'image/jpeg',
        Key: key
    };
    await uploadAsync(req);
    return key;
}

async function uploadAsync(req) {
    return new Promise((resolve, reject) => {
        s3.putObject(req, (err, data) => {
            if (err) return reject(err);
            else resolve(data);
        });
    });
}
