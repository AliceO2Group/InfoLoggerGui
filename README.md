# InfoLoggerGui

Web app for querying infoLogger database and streaming logs in real-time with filtering.

```bash
git clone ...
cd InfoLoggerGui
mkdir cert
openssl req -nodes -x509 -newkey rsa:4096 -keyout cert/key.pem -out cert/cert.pem -days 365
mv config-default.js config.js
# configure your mysql instance, see below
# register on Oauth, see below
vi config.js
npm install
npm run ils # if fake InfoLoggerServer needed
npm start
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

Before starting the InfoLoggerGui (which is a server/client view), you should have a InfoLoggerServer and MySQL running (which store the logs) and configured in config.js

### Compatibility

All browsers, starting from IE 12 (Edge)

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

```bash
echo "CREATE DATABASE INFOLOGGER;" | mysql
mysql INFOLOGGER < logs.sql
mysql
use INFOLOGGER;
select * from messages limit 10;
```

If the server is remote with private port, you can build a bridge: `ssh -L 3306:127.0.0.1:3306 user@remote`

### Install on CentOS 7

```bash
yum install epel-release
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
yum install -y nodejs
yum install git
cd /opt
git clone https://github.com/AliceO2Group/InfoLoggerGui.git
cd InfoLoggerGui
npm install --production
vim /etc/systemd/system/infologgergui.service # see below
systemctl daemon-reload
systemctl start infologgergui.service
systemctl status infologgergui.service

```

```bash
[Unit]
Description=InfoLoggerGui
After=network.target

[Service]
User=nobody
Group=nobody
WorkingDirectory=/opt/InfoLoggerGui
ExecStart=/usr/bin/npm run start # replace start by demo for fake live data
Restart=always
StandardError=syslog
```

### Credits

Favicon made by Freepik from www.flaticon.com

