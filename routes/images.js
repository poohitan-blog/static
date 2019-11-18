const express = require('express');
const request = require('request');
const requestPromise = require('request-promise-native');
const mime = require('mime-types');
const sharp = require('sharp');
const etag = require('etag');

const config = require('../config').current;

const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

const PREVIEW_WIDTH = 100;
const PREVIEW_BLUR = 10;

const { name: spacesName, endpoint: spacesEndpoint } = config.digitalOcean.spaces;
const { environment } = config;

function generatePlaceholder(image) {
  return sharp(image)
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .blur(PREVIEW_BLUR)
    .toBuffer();
}

function resize(image, { width, height }) {
  return sharp(image)
    .resize(width, height, { withoutEnlargement: true })
    .toBuffer();
}

router.get('/:filename', async (req, res, next) => {
  const { filename } = req.params;
  const { width, height, placeholder } = req.query;
  const originalURL = `https://${spacesName}.${spacesEndpoint}/${environment}/images/${filename}`;

  res.set({
    'Content-Disposition': 'inline',
    'Content-Type': mime.lookup(filename),
  });

  if (placeholder) {
    const image = await requestPromise(originalURL, { encoding: null });
    const preview = await generatePlaceholder(image);

    res.set('ETag', etag(preview));

    return res.send(preview);
  }

  if (width || height) {
    const image = await requestPromise(originalURL, { encoding: null });
    const resizedImage = await resize(image, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
    });

    res.set('ETag', etag(resizedImage));

    return res.send(resizedImage);
  }

  return request(originalURL)
    .pipe(res)
    .on('error', error => next(error));
});

router.use(errorHandler);

module.exports = router;
