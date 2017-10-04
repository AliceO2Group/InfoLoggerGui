const net = require('net');
const EventEmitter = require('events');
const log = require('@aliceo2/aliceo2-gui').Log;

const protocols = [
  {
    version: '1.4',
    fields: [
      {name: 'severity', type: String},
      {name: 'level', type: Number},
      {name: 'timestamp', type: String},
      {name: 'hostname', type: String},
      {name: 'rolename', type: String},
      {name: 'pid', type: Number},
      {name: 'username', type: String},
      {name: 'system', type: String},
      {name: 'facility', type: String},
      {name: 'detector', type: String},
      {name: 'partition', type: String},
      {name: 'run', type: Number},
      {name: 'errcode', type: Number},
      {name: 'errline', type: Number},
      {name: 'errsource', type: String},
      {name: 'message', type: String}
    ]
  }
];

/* @class Streamer
 * Connects to server
 * Stream data
 * Parse data
 * Emit row ony by one
 */

module.exports = class LiveDataSource extends EventEmitter {
  constructor() {
    super();

    // Declare properties
    this.client = null;
  }

  /* @param options Object contains port and host
   * All options see https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener
   */
  connect(options) {
    if (this.client) {
      return;
    }

    this.client = net.createConnection(options);
    this.client.on('data', this.onData.bind(this));

    this.client.on('connect', () => {
      log.info('Connected to infoLoggerServer');
    });

    this.client.on('end', () => {
      log.error('Connection to infoLoggerServer ended');
    });
  }

  disconnect() {
    if (!this.client) {
      return;
    }

    this.client.end();
    this.client = null; // gc
  }

  onData(data) {
    const message = this.parse(data.toString());

    if (!message) {
      return; // not a valid message
    }

    this.emit('message', message);
  }

  parse(trame) {
    // Example of input:
    // *1.4#I##1505140368.399439#aido2db##143388#root#########test Mon Sep 11 16:32:48 CEST 2017

    // Check trame integrity (header and footer)
    if (trame[0] !== '*') {
      log.info(`Parsing: discard uncomplete trame (length=${trame.length}), must begins with *`);
      return;
    }

    if (trame[trame.length - 1] !== '\n') {
      log.info(`Parsing: discard uncomplete trame (length=${trame.length}), must ends with \\n`);
      return;
    }

    // Check if we support this protocol version
    const trameVersion = trame.substr(1, 3);
    const trameProtocol = protocols.find(protocol => protocol.version === trameVersion);
    if (!trameProtocol) {
      const protocolsVersions = protocols.map(protocol => protocol.version);
      log.error(`Parsing: unreconized protocol, found "${trameVersion}", support ${protocolsVersions.join(', ')}`);
      return;
    }

    // Get trame content by removing the protocol's header and footer
    const content = trame.substr(5, trame.length - 5 - 2);
    const fields = content.split('#');

    // Check trame integrity (number of fields)
    if (fields.length !== trameProtocol.fields.length) {
      log.error(`Parsing: expected ${trameProtocol.fields.length} fields for protocol version ${trameProtocol.version}, found ${fields.length}`);
      return;
    }

    // Parse message
    const message = {};
    trameProtocol.fields.forEach((fieldDefinition, i) => {
      message[fieldDefinition.name] = fieldDefinition.type === Number ? parseInt(fields[i], 10) : fields[i];
    });

    return message;
  }
}
