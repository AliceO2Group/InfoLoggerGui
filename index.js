const log = require('./lib/logger');
const HttpServer = require('@aliceo2/aliceo2-gui').HttpServer;
const WebSocket = require('@aliceo2/aliceo2-gui').WebSocket;
const WebSocketMessage = require('@aliceo2/aliceo2-gui').WebSocketMessage;
const fs = require('fs');

const config = require('./config.js');

const SQLDataSource = require('./lib/SQLDataSource');
const LiveDataSource = require('./lib/LiveDataSource');

const helpMarkdown = fs.readFileSync('./docs/user-guide.md');

process.once('uncaughtException', function(e) {
  if (e.code === 'EADDRINUSE') {
    log.error('Port is already used');
  }

  log.error(e.stack || e);
  process.exit(1);
});

// Quick check config at start
log.info('MySQL: \t\t%s',
  `${config.mysql.host}:${config.mysql.port}`);
log.info('InfoLoggerServer: \t%s',
  `${config.infoLoggerServer.host}:${config.infoLoggerServer.port}`);
log.info('HTTP full link: \t%s',
  `http://${config.http.hostname}:${config.http.port}`);
log.info('HTTPS full link: \t%s',
  `https://${config.http.hostname}:${config.http.portSecure}`);

// Start servers
const http = new HttpServer(config.http, config.jwt, config.oAuth);
const websocketServer = new WebSocket(http, config.jwt);

// Create data instances
const sql = new SQLDataSource(config.mysql);
const stream = new LiveDataSource();

// Configuration variable for client
http.passToTemplate('hostname', config.http.hostname);
http.passToTemplate('port', config.http.portSecure);
http.passToTemplate('helpMarkdown', helpMarkdown);

http.post('/query', function(req, res) {
  const filters = req.body.filters;
  const limit = req.body.limit;

  sql
    .queryFromFilters(filters, {limit})
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({message: err.message});
    });
});

stream.connect(config.infoLoggerServer);
stream.on('message', (message) => {
  const res = new WebSocketMessage(200)
    .setCommand('message')
    .setPayload(message);
  websocketServer.broadcast(res);
});
