const log = require('@aliceo2/aliceo2-gui').Log;
const HttpServer = require('@aliceo2/aliceo2-gui').HttpServer;
const WebSocket = require('@aliceo2/aliceo2-gui').WebSocket;
const Response = require('@aliceo2/aliceo2-gui').Response;

const config = require('./config.js');

var SQLDataSource = require('./lib/SQLDataSource');
var LiveDataSource = require('./lib/LiveDataSource');

// Quick check config at start
log.info('MySQL server host: %s', '127.0.0.1');
log.info('HTTPS server port: %s', config.http.portSecure);

// Start servers
const http = new HttpServer(config.http, config.jwt, config.oAuth);
const websocketServer = new WebSocket(http.server, config.jwt);

// Create data instances
const sql = new SQLDataSource();
const stream = new LiveDataSource();


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
  stream.connect({port: 6102, host: 'aido2db.cern.ch'});
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
