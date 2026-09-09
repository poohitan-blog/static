const config = require('../config').current;

const { allowedOrigins } = config;

module.exports = (req, res, next) => {
  const { origin } = req.headers;

  res.vary('Origin');

  if (origin && allowedOrigins.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};
