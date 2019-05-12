const { ExifImage } = require('exif');

module.exports = imagePath => {
    return new Promise((resolve, reject) => {
        new ExifImage({ image: imagePath }, (err, data) => {
            if (err) {
                console.error(err);
                return resolve({});
            }
            const { exif, gps, image, thumbnail } = data;
            const result = {};

            // store the complete data in case the exif cache
            // needs to be rebuilt later.
            result.source_data = data;

            // general info about the camera & lens:
            result.camera_make = image.Make;
            result.camera_model = image.Model;
            result.lens_make = exif.LensMake;
            result.lens_model = exif.LensModel;

            Object.assign(result, getDetailedLensInfo(exif));
            Object.assign(result, getGPSInfo(gps));

            // the main exposure settings:
            result.exposure_time = exif.ExposureTime;
            result.fstop = exif.FNumber;
            result.iso = exif.ISO;

            // secondary exposure settings:
            result.exposure_compensation = exif.ExposureCompensation;
            result.flash = exif.Flash;
            result.focal_length = exif.FocalLength;
            result.focal_length_in_35mm = exif.FocalLengthIn35mmFormat;

            result.create_date = convertExifDate(exif.CreateDate);
            result.date_original = convertExifDate(exif.DateTimeOriginal);

            resolve(result);
        });
    });
};

function convertExifDate(date) {
    if (!date) {
        return null;
    }
    let [datePart, timePart] = date.split(' ');
    datePart = datePart.replace(/:/g, '-');

    return new Date(datePart + 'T' + timePart).toISOString();
}

function getDetailedLensInfo(exif) {
    const result = {};
    const data = exif.LensInfo;

    if (data && Array.isArray(data)) {
        result.lens_min_focal_length = data[0];
        result.lens_max_focal_length = data[1];
        result.lens_min_fstop = data[2];
        result.lens_max_fstop = data[3];
    }

    return result;
}

const requiredGPSProperties = ['GPSLatitudeRef', 'GPSLatitude', 'GPSLongitudeRef', 'GPSLongitude'];

function getGPSInfo(gps) {
    const result = {};

    if (gps && requiredGPSProperties.every(p => !!gps[p])) {
        requiredGPSProperties.forEach(prop => {
            result[prop] = gps[prop];
        });
    }

    return result;
}
