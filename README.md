# infoLoggerGui

Web app for querying infoLogger database and streaming logs in real-time with filtering.

```
$ git clone ...
$ create ssl keys, configure config.js
$ npm install
$ npm start
```

Command  | Result
------------- | -------------
npm start | start app in production mode
npm run dev | start app in dev mode with auto-restart on file change
npm run test | will run eslint, mocha and qunit
npm run doc | build the doc in docs/API.md
npm run coverage | report coverage of tests

### Compatibility

All browsers, starting from IE 12 (Edge)

# How to develop

### Generating SSL key

It generates two files without pass phrase.

$ mkdir cert
$ openssl req -nodes -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

### Working with remote MariaSQL server

During development you can use SSH Tunnels to use a distant SQL server without opening him to the world which is a security issue cause of bruteforce.

$ ssh -L 3306:127.0.0.1:3306 user@remote

### Configuration

The content of config.js must be as follow

TABLE HERE

### Insert fake data

```
$ mysql -u root -p INFOLOGGER < logs.sql
$ mysql
$ use INFOLOGGER;
$ select * from messages limit 10;
```

