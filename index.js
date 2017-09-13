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


http.post('/query', function(req, res, next) {
  const limit = 1000;
  const filters = req.body.filters;

  var request = 'select * from messages ';
  const values = [];
  const queryPartMatches = Object.keys(filters.match)
    .map(function(fieldName) {
      if (filters.match[fieldName] === ''
       || filters.match[fieldName] === undefined
       || filters.match[fieldName] === null) {
        return null;
      }

      values.push(filters.match[fieldName]);
      return `(${fieldName} = ?)`;
    });
  const queryPartExcludes = Object.keys(filters.exclude)
    .map(function(fieldName) {
      if (filters.exclude[fieldName] === ''
       || filters.exclude[fieldName] === undefined
       || filters.exclude[fieldName] === null) {
        return null;
      }

      values.push(filters.exclude[fieldName]);
      return `(${fieldName} != ?)`;
    });

  const queryPartMatchesExcludes = queryPartMatches
    .concat(queryPartExcludes)
    .filter(value => !!value);

  if (queryPartMatchesExcludes.length) {
    request += 'where ' + queryPartMatchesExcludes.join(' AND ');
  }
  request += 'limit ' + limit;
  console.log('request:', request);
  c.query(request, values, function(err, rows) {
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

// force connect and try connection
c.query('select 1', function(err, rows) {
  if (err)
    throw err;
});

c.on('ready', console.log);
c.on('error', console.log);
c.on('close', console.log);
c.on('end', console.log);


var Streamer = require('./lib/Streamer');
var stream = new Streamer();

stream.on('message', message => {
  const res = new Response(200);
  res.command('message').payload(message);
  websocketServer.broadcast(JSON.stringify(res.json));
});


http.post('/liveStart', function(req, res, next) {
  stream.connect({port: 6102, host: 'aido2db.cern.ch'});
  res.json({ok: 1});
});

http.post('/liveStop', function(req, res, next) {
  stream.disconnect();
  res.json({ok: 1});
});

