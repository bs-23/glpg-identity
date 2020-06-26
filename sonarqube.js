const path = require('path');
const sonarqubeScanner = require('sonarqube-scanner');
const config = require(path.join(process.cwd(), 'src/config/server/config'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

(async function() {
    await config.initEnvironmentVariables();

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
