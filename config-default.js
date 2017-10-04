module.exports = {
  jwt: {
    secret: '--',
    issuer: 'alice-o2-gui',
    expiration: '1d',
    maxAge: '1d'
  },
  oAuth: {
    secret: '--',
    id: '--',
    tokenHost: 'https://oauth.web.cern.ch',
    tokenPath: '/OAuth/Token',
    authorizePath: '/OAuth/Authorize',
    redirect_uri: 'https://vcap.me:8443/callback',
    scope: 'https://oauthresource.web.cern.ch/api/User',
    state: '3(#0/!~',
    resource: {
      hostname: 'oauthresource.web.cern.ch',
      path: '/api/User',
      port: 443
    }
  },
  http: {
    port: 8080,
    portSecure: 8443,
    hostname: 'vcap.me',
    key: './cert/key.pem',
    cert: './cert/cert.pem'
  },
  infoLoggerServer: {
    host: 'localhost',
    port: 6102
  },
  mysql: { // all options: https://github.com/mysqljs/mysql#connection-options
    host: '127.0.0.1',
    user: 'root',
    password: '--',
    database: 'INFOLOGGER',
    port: 3306
  }
};
