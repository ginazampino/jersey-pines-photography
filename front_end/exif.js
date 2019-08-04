/**
 * This module is used for formatting EXIF tags for user visible sections of the site.
 * It deals with edge-cases and other strange situations that arise from parsing EXIF
 * tag data.
 */

export class ExifTagParser {
    constructor(exif) {
        this.exif = exif;
    }

    camera_make_and_model() {
        let make = this._camera_make();
        let model = this._camera_model();

        [make, model] = fixCameraMakeModel(make, model);

        if (make && model) return make + ' ' + model;
        if (make) return make;
        if (model) return model;
    }

    exposure_time() {
        if (typeof this.exif.exposure_time === 'number') {
            if (this.exif.exposure_time > 1) {
                return this.exif.exposure_time.toFixed(1) + 's';
            } else {
                return '1/' + (1 / this.exif.exposure_time).toFixed(0);
            }
        }
        if (typeof this.exif.exposure_time === 'string') return this.exif.exposure_time;
        return null;
    }

    focal_length() {
        if (typeof this.exif.focal_length === 'number') return this.exif.focal_length + 'mm';
        if (typeof this.exif.focal_length === 'string') return this.exif.focal_length;
        return null;
    }

    fstop() {
        if (typeof this.exif.fstop === 'number') return 'f/' + this.exif.fstop;
        if (typeof this.exif.fstop === 'string') return this.exif.fstop;
        return null;
    }

    iso() {
        if (typeof this.exif.iso === 'number') return 'ISO-' + this.exif.iso;
        if (typeof this.exif.iso === 'string') return this.exif.iso;
        return null;
    }

    lens() {
        let value = '';

        if (typeof this.exif.lens_make === 'string') value += this.exif.lens_make;
        if (typeof this.exif.lens_model === 'string') {
            if (value) value += ' ';
            value += this.exif.lens_model;
        }

        return fixLensMakeModel(value);
    }

    _camera_make() {
        if (typeof this.exif.camera_make === 'string') return this.exif.camera_make;
        return null;
    }

    _camera_model() {
        if (typeof this.exif.camera_model === 'string') return this.exif.camera_model;
        return null;
    }
}

function fixCameraMakeModel(make, model) {
    if (make === 'NIKON CORPORATION' && /^NIKON/i.test(model)) {
        return [null, model];
    }
    if (typeof make === 'string') make = make.replace(/\0/g, '');
    if (typeof model === 'string') model = model.replace(/\0/g, '');
    return [make, model];
}

function fixLensMakeModel(makeModel) {
    return makeModel
        .replace(/\.\d+/g, '')
        .replace(/(\d) +mm/g, function(_, number) {
            return number + 'mm';
        })
        .replace(/\0/g, '');
}
