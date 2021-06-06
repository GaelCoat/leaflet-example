var env = process.env.NODE_ENV || 'local';

var config = {
  port: process.env.PORT || 6969,
  mongo: {
    api: {
      host: process.env.MONGODB_ADDON_URI || "mongodb://localhost/monparcours"
    }
  },
  GRAPHQL_API_URL: process.env.GRAPHQL || 'http://localhost:3000/graphql',
  JWT_SECRET: process.env.JWT_SECRET || 'yT.M_S^KhgZSXEXm:f%:MC}2~xg=v7mnQyWQ]tCq2,s:T[z',
  PUBLIC_CLIENT_TOKEN_EXPIRATION: process.env.PUBLIC_CLIENT_TOKEN_EXPIRATION || 45,
  gmap: 'AIzaSyAXtuFIrE651JtRwsI7b6VSqOcOunlKYsA',
  secret: '1f47zae66s',
  universe:  '5ddn6za4-ne97-532g-mon2-1wnjz18dkra6',
  s3: {
    accessKeyId: process.env.CELLAR_ADDON_KEY_ID,
    secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET,
    endpoint: process.env.CELLAR_ADDON_HOST,
    maxAsync: 9999,
    retryCount: 1,
    retryDelay: 3000,
    host: 'https://'+process.env.CELLAR_ADDON_HOST+'/compressed/',
    bucket: {
      name: 'compressed',
      acl: 'public-read'
    }
  },
  api: {
    url: process.env.API_URL || 'localhost',
    port: process.env.API_PORT || 8080,
  },
  session: {
    secret: "za5e6s6azKzsae?s5az",
    cookie: {
      maxAge : 86400000,
      secure: false,
    },
    saveUninitialized: true,
    resave: true
  },
}

module.exports = config;
