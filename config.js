const config = {
  development: {
    port: 3500,

    digitalOcean: {
      spaces: {
        name: 'poohitan-com',
        endpoint: 'ams3.cdn.digitaloceanspaces.com',
      },
    },
  },

  production: {
    port: 3100,

    digitalOcean: {
      spaces: {
        name: 'poohitan-com',
        endpoint: 'ams3.cdn.digitaloceanspaces.com',
      },
    },
  },
};

const environment = process.env.NODE_ENV;

if (!environment) {
  throw new Error('Missing NODE_ENV environment variable');
}

module.exports = {
  ...config,
  current: {
    environment,
    ...config[environment],
  },
};
