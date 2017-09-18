const net = require('net');
const EventEmitter = require('events');

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
    this.filters = null;
  }

  /* @param options Object contains port and host
   * All options see https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener
   */
  connect(options) {
    if (this.client) {
      console.info('Streamer: already connected');
      return;
    }

    this.client = net.createConnection(options);
    this.client.on('data', this.onData.bind(this));
    this.client.on('end', console.log);
  }

  disconnect() {
    if (!this.client) {
      console.info('Streamer: already disconnected');
      return;
    }

    this.client.end();
    this.client = null; // gc
  }

  // getter / setter for filtering live data
  setfilters(filters) {
    if (arguments.length) {
      this.filters = filters;
    }

    return this.filters;
  }

  onData(data) {
    const message = this.parse(data.toString());

    if (!message) {
      return; // not a valid message
    }

    if (this.isFiltered(message)) {
      return; // client is not interested by this one
    }

    this.emit('message', message);
  }

  // tell if the message is filtered based on filters setted
  // @returns bool
  isFiltered(message) {
    const matchFilters = this.filters.match;
    const excludeFilters = this.filters.exclude;
    const matchFields = Object.keys(matchFilters);
    const excludeFields = Object.keys(excludeFilters);

    // returns true on first mismatch
    for (let i = 0; i < matchFields.length; i++) {
      const fieldName = matchFields[i];
      const fieldValue = matchFilters[fieldName];
      const messageFieldValue = message[fieldName];

      // empty filter means nothing to check here
      if (!fieldValue) {
        continue;
      }

      if (!this._isFieldMatching(fieldValue, messageFieldValue)) {
        return true; // not matching, filter it
      }
    }

    for (let i = 0; i < excludeFields.length; i++) {
      const fieldName = excludeFields[i];
      const fieldValue = excludeFilters[fieldName];
      const messageFieldValue = message[fieldName];

      // empty filter means nothing to check here
      if (!fieldValue) {
        continue;
      }

      if (this._isFieldMatching(fieldValue, messageFieldValue)) {
        return true;
      }
    }

    // not filtered, you shall pass
    return false;
  }

  _cleanString(string) {
    if (typeof string !== 'string') {
      string = new String(string);
    }

    return string.trim();
  }

  // compare filter to value and tell is the value is valid or not
  // it handles also OR commands given by a space separator
  _isFieldMatching(filterValue, dataValue) {
    filterValue = this._cleanString(filterValue);

    // look for pipe(s) command which means OR command
    const pipeParts = filterValue.split(' ');
    for (var i = 0; i < pipeParts.length; i++) {
      if (pipeParts[i].trim() === dataValue) {
        return true;
      }
    }

    // does not match
    return false;
  }

  parse(trame) {
    // Example of input:
    // *1.4#I##1505140368.399439#aido2db##143388#root#########test Mon Sep 11 16:32:48 CEST 2017

    // Check trame integrity (header and footer)
    if (trame[0] !== '*') {
      console.info(`Parsing: discard uncomplete trame (length=${trame.length}), must begins with *`);
      return;
    }

    if (trame[trame.length - 1] !== '\n') {
      console.info(`Parsing: discard uncomplete trame (length=${trame.length}), must ends with \\n`);
      return;
    }

    // Check if we support this protocol version
    const trameVersion = trame.substr(1, 3);
    const trameProtocol = protocols.find(protocol => protocol.version === trameVersion);
    if (!trameProtocol) {
      const protocolsVersions = protocols.map(protocol => protocol.version);
      console.warn(`Parsing: unreconized protocol, found "${trameVersion}", support ${protocolsVersions.join(', ')}`);
      return;
    }

    // Get trame content by removing the protocol's header and footer
    const content = trame.substr(5, trame.length - 5 - 2);
    const fields = content.split('#');

    // Check trame integrity (number of fields)
    if (fields.length !== trameProtocol.fields.length) {
      console.warn(`Parsing: expected ${trameProtocol.fields.length} fields for protocol version ${trameProtocol.version}, found ${fields.length}`);
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
