var env = process.env.NODE_ENV || 'local';

var config = {
  port: process.env.PORT || 8500,
  mongo: {
    api: {
      //host: process.env.MONGODB_ADDON_URI || 'mongodb://localhost/test'
      host: process.env.MONGODB_ADDON_URI || 'mongodb+srv://coq-trotteur:qwACBcZ3pDO0rbcj@cluster0.ysust.mongodb.net/coq-trotteur-api-v2?retryWrites=true&w=majority'
      //host: process.env.MONGODB_ADDON_URI || 'mongodb+srv://coq-trotteur:qwACBcZ3pDO0rbcj@cluster0.ysust.mongodb.net/preprod?retryWrites=true&w=majority'
    }
  },
  //GRAPHQL_API_URL: process.env.GRAPHQL || 'http://localhost:3000/graphql',
  //GRAPHQL_API_URL: process.env.GRAPHQL || 'https://api-v2.coq-trotteur.com/graphql',
  GRAPHQL_API_URL: process.env.GRAPHQL || 'https://api-v2-dev-coq-trotteur.cleverapps.io/graphql',
  JWT_SECRET: process.env.JWT_SECRET || 'yT.M_S^KhgZSXEXm:f%:MC}2~xg=v7mnQyWQ]tCq2,s:T[z',
  PUBLIC_CLIENT_TOKEN_EXPIRATION: process.env.PUBLIC_CLIENT_TOKEN_EXPIRATION || 45,
  gmap: 'AIzaSyAXtuFIrE651JtRwsI7b6VSqOcOunlKYsA',
  secret: '1f47zae66s',
  universe:  '5ddn6za4-ne97-532g-mon2-1wnjz18dkra6',
  s3: {
    accessKeyId: process.env.CELLAR_ADDON_KEY_ID || "5TAJMZWC5ATFR31Q7ZGE",
    secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET || "fr2QshvNbo2YR8hd4VhxY1qhda1Jy5CxvMYMHBTk",
    endpoint: process.env.CELLAR_ADDON_HOST || "cellar-c2.services.clever-cloud.com",
    maxAsync: 9999,
    retryCount: 1,
    retryDelay: 3000,
    host: process.env.CELLAR_ADDON_HOST ? 'https://'+process.env.CELLAR_ADDON_HOST+'/monparcours-dev/' : 'https://cellar-c2.services.clever-cloud.com/monparcours-dev/',
    bucket: {
      name: 'monparcours-dev',
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
