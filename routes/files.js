const express = require('express');
const got = require('got');
const mime = require('mime-types');

const config = require('../config').current;
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

const { name: spacesName, endpoint: spacesEndpoint } = config.digitalOcean.spaces;
const { environment } = config;

router.get('/:filename', (req, res, next) => {
  const { filename } = req.params;
  const originalURL = `https://${spacesName}.${spacesEndpoint}/${environment}/files/${filename}`;

  res.header({
    'Content-Disposition': 'attachment',
    'Content-Type': mime.lookup(filename),
  });

  got.stream(originalURL)
    .pipe(res)
    .on('error', (error) => next(error));
});

router.use(errorHandler);

module.exports = router;
