const log = require('@aliceo2/aliceo2-gui').Log;
const HttpServer = require('@aliceo2/aliceo2-gui').HttpServer;
const WebSocket = require('@aliceo2/aliceo2-gui').WebSocket;
const Response = require('@aliceo2/aliceo2-gui').Response;

const config = require('./config.js');

// Quick check config at start
log.info('MySQL server host: %s', '127.0.0.1');
log.info('HTTPS server port: %s', config.http.portSecure);

const http = new HttpServer(config.http, config.jwt, config.oAuth);
const websocketServer = new WebSocket(http.server, config.jwt);


http.post('/hello', function(req, res, next) {
  c.query('select * from messages limit 50', function(err, rows) {
    if (err) {
      res.status(500).send();
      throw err;
    }

    res.json(rows);
  });
});

var Client = require('mariasql');
var c = new Client({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  db: 'INFOLOGGER'
});

c.query('select * from messages limit 10', function(err, rows) {
  if (err)
    throw err;
  // console.dir(rows);
});

c.on('ready', console.log);
c.on('error', console.log);
c.on('close', console.log);
c.on('end', console.log);


var Streamer = require('./lib/Streamer');
var stream = new Streamer();
stream.connect({port: 6102, host: 'aido2db.cern.ch'});
stream.on('message', message => {
  const res = new Response(200);
  res.command('message').payload(message);
  websocketServer.broadcast(JSON.stringify(res.json));
});

