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

    server: {
      host: '46.101.99.203',
      username: 'poohitan',
      folder: '~/poohitan.com/static',
    },

    git: {
      repo: 'git@github.com:poohitan-blog/static.git',
      branch: 'stable',
    },

    pm2: {
      appName: 'poohitan-com-static',
    },

    digitalOcean: {
      spaces: {
        name: 'poohitan-com',
        endpoint: 'ams3.cdn.digitaloceanspaces.com',
      },
    },
  },
};

const environment = process.env.NODE_ENV;

module.exports = {
  ...config,
  current: {
    ...environment,
    ...config[environment],
  },
};
