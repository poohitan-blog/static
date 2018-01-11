const express = require('express');
const request = require('request');
const mime = require('mime-types');

const config = require('../config').current;
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/:filename', (req, res, next) => {
  const originalURL = `https://${config.digitalOcean.spaces.name}.${config.digitalOcean.spaces.endpoint}/${config.environment}/files/${req.params.filename}`;

  res.header({
    'Content-Disposition': 'attachment',
    'Content-Type': mime.lookup(req.params.filename),
  });

  request(originalURL)
    .pipe(res)
    .on('error', error => next(error));
});

router.use(errorHandler);

module.exports = router;
