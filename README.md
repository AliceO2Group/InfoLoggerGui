# InfoLoggerGui

Web app for querying infoLogger database and streaming logs in real-time with filtering.

```
$ git clone ...
$ cd InfoLoggerGui
$ mkdir cert
$ openssl req -nodes -x509 -newkey rsa:4096 -keyout cert/key.pem -out cert/cert.pem -days 365
$ mv config-default.js config.js
$ vi config.js
$ npm install
$ npm start
```

You need a MySQL and a InfoLoggerServer to connect to. InfoLoggerServer can be faked using `npm run ils`.

Command  | Result
------------- | -------------
npm start | start app in production mode
npm run dev | start app in dev mode with auto-restart on file change
npm run test | will run eslint, mocha and qunit
npm run doc | build the doc in docs/API.md
npm run coverage | report coverage of tests
npm run ils | start local InfoLoggerServer with fake real-time data for dev purpose
npm run demo | start both InfoLoggerGui and a fake InfoLoggerServer

Before starting the InfoLoggerGui (which is a server/client view), you should have a InfoLoggerServer and MySQL running (which store the logs) and configured in config.js, all this can be found here: https://github.com/AliceO2Group/InfoLogger/blob/master/doc/README.md

### Compatibility

All browsers, starting from IE 12 (Edge)

# How to develop

### Working with remote MariaSQL server

During development you can use SSH Tunnels to use a distant SQL server without opening him to the world which is a security issue cause of bruteforce.

$ ssh -L 3306:127.0.0.1:3306 user@remote

### Register CERN OAuth

1. Go https://sso-management.web.cern.ch/OAuth/RegisterOAuthClient.aspx
1. client_id is whatever you want
1. redirect_uri is like https://hostname:port/callback
1. Generate and put the secret to your config.js
1. submit request

### Configuration

Copy config-default.js to config.js then change values as follow.

Path  | Description
------------- | -------------
oAuth.secret | password from your oauth registration
oAuth.id | login from your oauth registration
oAuth.redirect_uri | the URL of this application like https://hostname:port/callback
http.hostname | should be the one from redirect_uri
infoLoggerServer.{host,port} | empty if you don't want to use
mysql.{host,user,password} | empty if you don't want to use

Other fields should be ok by default for your configuration at CERN.

### Insert fake data into MySQL and check them

```
$ echo "CREATE DATABASE INFOLOGGER;" | mysql
$ mysql INFOLOGGER < logs.sql
$ mysql
$ use INFOLOGGER;
$ select * from messages limit 10;
```

### Credits

Favicon made by Freepik from www.flaticon.com

