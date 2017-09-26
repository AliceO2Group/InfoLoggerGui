const Client = require('mariasql');

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
    const values = [];

    // Gives ['severity=? OR severity=? OR ...', 'hostname=? OR hostname=? OR ...', ...]
    const matchCriterias = Object.keys(filters.match)
      .map((fieldName) => {
        if (!filters.match[fieldName]) {
          return null;
        }

        const matchValue = this._cleanString(filters.match[fieldName]);
        const matchValueParts = matchValue.split(' ');

        // Gives 'severity=? OR severity=? OR ...'
        return matchValueParts
          .map(valuePart => {
            values.push(valuePart);
            return `\`${fieldName}\`=?`;
          })
          .join(' OR ');
      });

    const excludeCriterias = Object.keys(filters.exclude)
      .map((fieldName) => {
        if (!filters.exclude[fieldName]) {
          return null;
        }

        const excludeValue = this._cleanString(filters.exclude[fieldName]);
        const excludeValueParts = excludeValue.split(' ');

        // Gives '(severity!=? OR severity IS NULL) OR (severity=? OR severity IS NULL) OR ...'
        return excludeValueParts
          .map(valuePart => {
            values.push(valuePart);
            return `(\`${fieldName}\`!=? OR \`${fieldName}\` IS NULL)`;
          })
          .join(' AND ');
      });

    const allCriterias = matchCriterias
      .concat(excludeCriterias)
      .filter(value => !!value);
    const criteriasString = allCriterias.length ? `where ${allCriterias.join(' AND ')}` : '';
    const request = `select * from messages ${criteriasString} order by timestamp limit ${limit}`;

    console.log('request:', request);
    this.client.query(request, values, callback);
  }

  _cleanString(string) {
    if (typeof string !== 'string') {
      string = new String(string);
    }

    return string.trim();
  }
}

