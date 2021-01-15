'use strict';

exports.config = {
    app_name: [process.env.NEW_RELIC_APP_NAME],
    license_key: process.env.NEW_RELIC_LICENSE_KEY,
    logging: {
        level: 'info',
        filepath: 'newrelic_agent.log'
    },
    slow_sql: {
        enabled: true
    },
    transaction_tracer: {
        record_sql: 'raw',
        attributes: {
            exclude: ['password']
        }
    }
}
