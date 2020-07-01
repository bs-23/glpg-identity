const path = require('path');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

exports.config = {
    app_name: [process.env.NEWRELIC_APP_NAME],
    license_key: nodecache.getValue('NEWRELIC_LICENSE_KEY'),
    logging: {
        level: 'info'
        // filepath: 'newrelic_agent.log'
    },
    utilization: {
        detect_aws: false,
        detect_pcf: false,
        detect_azure: false,
        detect_gcp: false,
        detect_docker: false
    },
    transaction_tracer: {
        enabled: true
    }
}