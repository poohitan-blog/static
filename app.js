const express = require('express');

const config = require('./config').current;
const errorHandler = require('./middlewares/error-handler');
const routes = require('./routes');

const app = express();

app.get('/', (req, res) => {
  res.send('Іди геть.');
});

Object.keys(routes).forEach((route) => {
  const router = routes[route];

  if (typeof router === 'function') {
    app.use(`/${route}`, router);
  }
});

app.use(errorHandler);

app.listen(config.port);

console.log('Listening on port', config.port);
