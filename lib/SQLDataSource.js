const Client = require('mariasql');
const log = require('@aliceo2/aliceo2-gui').Log;

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

  /**
   * Ask DB for a part of rows and the total count
   * @param {object} filters - criterias like MongoDB
   * @param {object} options - limit, etc.
   * @return {promise} results
   */
  queryFromFilters(filters, options, callback) {
    if (!filters) {
      throw new Error('filters parameter is mandatory');
    }
    if (!options) {
      throw new Error('options parameter is mandatory');
    }

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

    // The rows asked with a limit
    const rows = new Promise((resolve, reject) => {
      const request = `SELECT * FROM \`messages\` ${criteriasString} ORDER BY \`TIMESTAMP\` LIMIT ${options.limit}`;
      log.info('request:', request, values);
      this.client.query(request, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });

    // Count the total number of rows for this filters
    const total = new Promise((resolve, reject) => {
      const request = `SELECT COUNT(*) as total FROM \`messages\` ${criteriasString}`;
      log.info('total:', request, values);
      this.client.query(request, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });

    return Promise.all([rows, total]).then((values) => {
      return {
        rows: values[0],
        total: parseInt(values[1][0].total, 10),
        limit: options.limit
      };
    });
  }
}

