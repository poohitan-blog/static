const express = require('express');
const request = require('request');
const mime = require('mime-types');
const sharp = require('sharp');

const config = require('../config').current;

const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

const PREVIEW_PARAM = ':preview';
const PREVIEW_WIDTH = 600;
const PREVIEW_BLUR = 40;
const PREVIEW_QUALITY = 20;

function generatePreview() {
  return sharp()
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .blur(PREVIEW_BLUR)
    .jpeg({ quality: PREVIEW_QUALITY });
}

router.get('/:filename', (req, res, next) => {
  const { filename } = req.params;
  const previewRequested = filename.includes(PREVIEW_PARAM);
  const originalFilename = previewRequested ? filename.replace(PREVIEW_PARAM, '') : filename;
  const originalURL = `https://${config.digitalOcean.spaces.name}.${config.digitalOcean.spaces.endpoint}/${config.environment}/images/${originalFilename}`;

  res.header({
    'Content-Disposition': 'inline',
    'Content-Type': mime.lookup(originalFilename),
  });

  if (previewRequested) {
    return request(originalURL)
      .pipe(generatePreview())
      .on('error', () => next(`Invalid image ${req.params.filename}`))
      .pipe(res)
      .on('error', error => next(error));
  }

  return request(originalURL)
    .pipe(res)
    .on('error', error => next(error));
});

router.use(errorHandler);

module.exports = router;
