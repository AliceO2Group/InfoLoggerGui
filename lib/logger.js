const winston = require('winston');

// Doc: https://github.com/winstonjs/winston/tree/2.x
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(
      {timestamp: true, colorize: true}
    )
  ],
  exitOnError: true
});

module.exports = logger;
