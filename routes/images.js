const express = require('express');
const got = require('got');
const mime = require('mime-types');
const sharp = require('sharp');
const etag = require('etag');

const config = require('../config').current;

const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

const PREVIEW_WIDTH = 30;

const { name: spacesName, endpoint: spacesEndpoint } = config.digitalOcean.spaces;
const { environment } = config;

function generatePlaceholder(image) {
  return sharp(image)
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .toBuffer();
}

function resize(image, { width, height, mimeType }) {
  if (mimeType === 'image/gif') { // resizing brakes animations
    return image;
  }

  return sharp(image)
    .resize(width, height, { withoutEnlargement: true })
    .toBuffer();
}

router.get('/:filename', async (req, res, next) => {
  const { filename } = req.params;
  const { width, height, placeholder } = req.query;
  const originalURL = `https://${spacesName}.${spacesEndpoint}/${environment}/images/${filename}`;

  const mimeType = mime.lookup(filename);

  res.set({
    'Content-Disposition': 'inline',
    'Content-Type': mimeType,
  });

  if (placeholder) {
    const image = await got(originalURL).buffer();
    const preview = await generatePlaceholder(image);

    res.set('ETag', etag(preview));

    return res.send(preview);
  }

  if (width || height) {
    const image = await got(originalURL).buffer();
    const resizedImage = await resize(image, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      mimeType,
    });

    res.set('ETag', etag(resizedImage));

    return res.send(resizedImage);
  }

  return got.stream(originalURL)
    .pipe(res)
    .on('error', (error) => next(error));
});

router.use(errorHandler);

module.exports = router;
