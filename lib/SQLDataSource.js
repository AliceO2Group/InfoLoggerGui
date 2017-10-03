const Client = require('mariasql');

module.exports = class SQLDataSource {
  constructor(options) {
    this.client = new Client(options);

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

  queryFromFilters(filters, limit, callback) {
    let values = [];
    const criterias = [];
    let criteriasString = '';

    /*
    How it translate:

    filters = {
      timestamp: {
        $gte: '2016-02-21T05:00:00.000Z'
      },
      level: {
        $lte: 6
      },
      severity: {
        $in: ['W', 'E']
      },
      username: {
        $nin: ['coucou']
      }
    }

    values = ['Sun Jan 01 1989 00:00:00 GMT+0100 (CET)', 6, 'W', 'E', ...]
    criterias = ['timestamp >= ?', 'level <= ?', 'severity in (?,?)', ...]
    criteriasString = timestamp >= ? and level <= ? and severity in (?,?) and ...
    */

    for (let field in filters) {
      for (let operator in filters[field]) {
        if (field === 'timestamp') {
          values = values.concat((new Date(filters[field][operator])).getTime() / 1000);
        } else {
          values = values.concat(filters[field][operator]);
        }

        switch(operator) {
          case '$gte':
            criterias.push(`\`${field}\`>=?`);
            break;
          case '$lte':
            criterias.push(`\`${field}\`<=?`);
            break;
          case '$in':
            criterias.push(`\`${field}\` IN (${filters[field][operator].map(() => '?').join(',')})`);
            break;
          case '$nin':
            // If field is null, don't exclude the value
            criterias.push(`(NOT(\`${field}\` IN (${filters[field][operator].map(() => '?').join(',')})) OR \`${field}\` IS NULL)`);
            break;
        }
      }
    }

    if (criterias.length) {
      criteriasString = `WHERE ${criterias.join(' AND ')}`;
    }
    const request = `SELECT * FROM \`messages\` ${criteriasString} ORDER BY \`TIMESTAMP\` LIMIT ${limit}`;

    console.log('request:', request, values);
    this.client.query(request, values, callback);
  }
}

