const log = require('@aliceo2/aliceo2-gui').Log;
const HttpServer = require('@aliceo2/aliceo2-gui').HttpServer;
const WebSocket = require('@aliceo2/aliceo2-gui').WebSocket;
const Response = require('@aliceo2/aliceo2-gui').Response;

const config = require('./config.js');

var SQLDataSource = require('./lib/SQLDataSource');
var LiveDataSource = require('./lib/LiveDataSource');

// Quick check config at start
log.info('MySQL: \t\t%s', `${config.mysql.host}:${config.mysql.port}`);
log.info('InfoLoggerServer: \t%s', `${config.infoLoggerServer.host}:${config.infoLoggerServer.port}`);
log.info('HTTP full link: \t%s', `http://${config.http.hostname}:${config.http.port}`);
log.info('HTTPS full link: \t%s', `https://${config.http.hostname}:${config.http.portSecure}`);

// Start servers
const http = new HttpServer(config.http, config.jwt, config.oAuth);
const websocketServer = new WebSocket(http.server, config.jwt);

// Create data instances
const sql = new SQLDataSource(config.mysql);
const stream = new LiveDataSource();

// Configuration variable for client
http.passToTemplate('hostname', config.http.hostname);
http.passToTemplate('port', config.http.portSecure);

http.post('/query', function(req, res, next) {
  const filters = req.body.filters;

  sql.queryFromFilters(filters, function(err, rows) {
    if (err) {
      res.status(500).send();
      throw err;
    }

    res.json(rows);
  });
});

http.post('/liveStart', function(req, res, next) {
  const filters = req.body.filters;
  stream.setfilters(filters);
  stream.connect(config.infoLoggerServer);
  res.json({ok: 1});
});

http.post('/liveStop', function(req, res, next) {
  stream.disconnect();
  res.json({ok: 1});
});

stream.on('message', message => {
  const res = new Response(200);
  res.command('message').payload(message);
  websocketServer.broadcast(JSON.stringify(res.json));
});
