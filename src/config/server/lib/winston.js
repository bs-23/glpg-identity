const winston = require('winston');
const newrelicFormatter = require('@newrelic/winston-enricher');

// const logger = winston.createLogger({
//     transports: [
//         new winston.transports.Console({
//             format: winston.format.combine(
//                 newrelicFormatter()
//             )
//         })
//     ]
// });

const logger = {
    log: function (err) {
        console.log('**************************** ', err);
    },
    info: function (err) {
        console.log('============================ ', err);
    },
    error: function (err) {
        console.log(':::::::::::::::::::::::::::: ', err);
    }
};

module.exports = logger;
