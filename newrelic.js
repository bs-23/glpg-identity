exports.config = {
    app_name: ['Customer Data Platform'],
    license_key: process.env.NEWRELIC_LICENSE_KEY,
    logging: {
        level: 'trace',
        filepath: './newrelic_agent.log'
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
