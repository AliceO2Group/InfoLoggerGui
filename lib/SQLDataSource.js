const mysql = require('mysql');
const log = require('./logger');

module.exports = class SQLDataSource {
  constructor(options) {
    this.options = options;
    this.connection = mysql.createPool(options);

    // force connect and try connection
    this.connection.query('select count(*) as total from messages;', (err, rows) => {
      if (err) {
        return this.errorHandler(err);
      }

      log.info(`Connected to mysql (${rows[0].total} logs inside)`);
    });
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
      this.connection.query(request, values, (err, result) => {
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
      this.connection.query(request, values, (err, result) => {
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
    }).catch((err) => {
      throw new Error(this.errorHandler(err));
    });
  }

  /**
   * The purpose is to translate Error object from mysql to more human one
   * so we can send it to final user when it can be recovered
   * @param {Error} err - the error from a catch or callback
   * @return {string} the new state of this source instance
   */
  errorHandler(err) {
    let message;

    // Handle some common errors and just report the user he can't use mysql
    if (err.code === 'ER_NO_DB_ERROR') {
      message = `Unable to connect to mysql, ${this.options.database} database not found`;
      log.warn(message);
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
      message = `Unable to connect to mysql, "messages" table not found in ${this.options.database}`;
      log.warn(message);
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      message = `Unable to connect to mysql on ${this.options.host}:${this.options.port}`;
      log.warn(message);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      message = `Unable to connect to mysql, access denied for ${this.options.user}`;
      log.warn(message);
    } else {
      message = `Unable to connect to mysql: ${err.code}`;
      log.error(err); // log the whole error because we don't know why connection crashed
    }

    return message;
  }
}

