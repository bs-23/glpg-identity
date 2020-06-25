require('dotenv').config();
const path = require('path');
const sonarqubeScanner = require('sonarqube-scanner');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const secretsManager = require(path.join(process.cwd(), 'src/config/server/lib/secrets-manager'));

(async function() {
    const secrets = await secretsManager.getSecrets();

    for (const key in secrets) {
        if(secrets.hasOwnProperty(key)) {
            nodecache.setValue(key, secrets[key]);
        }
    }

    sonarqubeScanner({
        serverUrl: nodecache.getValue('SONARQUBE_URL'),
        token: nodecache.getValue('SONARQUBE_TOKEN'),
        options: {
            'sonar.sources': 'src/modules/core/server, src/modules/user/server, src/modules/hcp/server',
            'sonar.tests': 'tests',
            'sonar.inclusions': '**',
            'sonar.test.inclusions': 'tests/**/*.spec.js',
            'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
            'sonar.testExecutionReportPaths': 'coverage/test-report.xml'
        }
    }, () => process.exit());
})();
