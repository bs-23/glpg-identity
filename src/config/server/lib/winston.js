const winston = require('winston');
const newrelicFormatter = require('@newrelic/winston-enricher');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                newrelicFormatter()
            )
        })
    ]
});

module.exports = logger;
