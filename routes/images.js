const express = require('express');
const request = require('request');
const requestPromise = require('request-promise-native');
const mime = require('mime-types');
const sharp = require('sharp');
const etag = require('etag');

const config = require('../config').current;

const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

const PREVIEW_PARAM = ':preview';
const PREVIEW_WIDTH = 600;
const PREVIEW_BLUR = 40;
const PREVIEW_QUALITY = 20;

function generatePreview(image) {
  return sharp(image)
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .blur(PREVIEW_BLUR)
    .jpeg({ quality: PREVIEW_QUALITY })
    .toBuffer();
}

router.get('/:filename', async (req, res, next) => {
  const { filename } = req.params;
  const previewRequested = filename.includes(PREVIEW_PARAM);
  const originalFilename = previewRequested ? filename.replace(PREVIEW_PARAM, '') : filename;
  const originalURL = `https://${config.digitalOcean.spaces.name}.${config.digitalOcean.spaces.endpoint}/${config.environment}/images/${originalFilename}`;

  res.set({
    'Content-Disposition': 'inline',
    'Content-Type': mime.lookup(originalFilename),
  });

  if (previewRequested) {
    const image = await requestPromise(originalURL, { encoding: null });
    const preview = await generatePreview(image);

    res.set('ETag', etag(preview));

    return res.send(preview);
  }

  return request(originalURL)
    .pipe(res)
    .on('error', error => next(error));
});

router.use(errorHandler);

module.exports = router;
