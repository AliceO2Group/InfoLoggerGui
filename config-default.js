module.exports = {
"jwt": {
    "secret": "<secret>",
    "issuer": "alice-o2-gui",
    "expiration": "45s",
    "maxAge": "2m"
  },
  "oAuth": {
    "secret": "<secret>",
    "id": "<id>",
    "tokenHost": "https://oauth.web.cern.ch",
    "tokenPath": "/OAuth/Token",
    "authorizePath": "/OAuth/Authorize",
    "redirect_uri": "https://vcap.me:8443/callback",
    "scope": "https://oauthresource.web.cern.ch/api/User",
    "state": "3(#0/!~",
    "resource": {
      "hostname": "oauthresource.web.cern.ch",
      "path": "/api/User",
      "port": 443
    }
  },
  "zeromq": {
    "sub": {
      "ip": "127.0.0.1",
      "port": 3000
    },
    "req": {
      "ip": "127.0.0.1",
      "port": 3001
    }
  },
  "http": {
    "port": 8080,
    "portSecure": 8443,
    "key": "./cert/key.pem",
    "cert": "./cert/cert.pem"
  },
  "log": {
    "console": "debug",
    "file": "error"
  },
  "websocket": {
    "hostname": "127.0.0.1"
  },
  "pushNotifications": {
    "vapid": {
      "publicKey": "<application server public key>",
      "privateKey": "<application server private key>",
      "email": "alice-o2-flp-prototype@cern.ch"
    },
    "APN": {
      "keyId": "<APN Key ID>",
      "teamId": "<APN Team ID>",
      "pushId": "<APN Push ID>",
      "authenticationToken": "<Authentication Token File Name>",
      "hostname": "<Host URL (must start with https)>"
    },
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "notifications"
  }
};
