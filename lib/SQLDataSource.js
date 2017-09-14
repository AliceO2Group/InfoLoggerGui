var Client = require('mariasql');

/*

check timestamp min et max

select timestamp
fields...
message
from messages
where
exclusive
inclusive
level <= ?
timestamp >= ?
timestamp <= ?
order by timestamp asc/desc limit $C_max_msg

*/

module.exports = class SQLDataSource {
  constructor() {
    this.client = new Client({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      db: 'INFOLOGGER'
    });

    // force connect and try connection
    this.client.query('select 1', function(err, rows) {
      if (err)
        throw err;
    });

    this.client.on('ready', console.log);
    this.client.on('error', console.log);
    this.client.on('close', console.log);
    this.client.on('end', console.log);
  }

  queryFromFilters(filters, callback) {
    const limit = 1000;
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
    this.client.query(request, values, callback);
  }
}

