const path = require('path');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

exports.config = {
    app_name: ["Customer Data Platform (dokcer)"],
    license_key: "eu01xx9b7a5e9042d58cf5e32c79816a5c74NRAL", //nodecache.getValue('NEW_RELIC_LICENSE_KEY'),
    logging: {
        level: 'trace'
        //filepath: 'newrelic_agent.log'
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
