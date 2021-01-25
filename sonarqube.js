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
            'sonar.sources': `src/modules/core/server,
                src/modules/platform/user/server,
                src/modules/platform/role/server,
                src/modules/platform/profile/server,
                src/modules/platform/faq/server,
                src/modules/platform/permission-set/server,
                src/modules/information/hcp/server,
                src/modules/consent/consent-category/client,
                src/modules/consent/consent-category/server,
                src/modules/consent/consent-country/client,
                src/modules/consent/consent-country/server,
                src/modules/consent/consent-performance/client,
                src/modules/consent/consent-performance/server,
                src/modules/consent/manage-consent/client,
                src/modules/consent/manage-consent/server,
                src/modules/platform/application/server,
                src/modules/core/client,
                src/modules/platform/user/client,
                src/modules/platform/role/client,
                src/modules/platform/profile/client,
                src/modules/platform/faq/client,
                src/modules/platform/permission-set/client,
                src/modules/information/hcp/client`,
            'sonar.tests': 'tests',
            'sonar.inclusions': '**',
            'sonar.test.inclusions': 'tests/**/*.spec.js',
            'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
            'sonar.testExecutionReportPaths': 'coverage/test-report.xml'
        }
    }, () => process.exit());
})();
