const sonarqubeScanner = require("sonarqube-scanner");

sonarqubeScanner({
    serverUrl: process.env.SONARQUBE_URL,
    token: process.env.SONARQUBE_TOKEN,
    options: {
        "sonar.sources": "src/modules/core/server, src/modules/user/server",
        "sonar.tests": "tests",
        "sonar.inclusions": "**",
        "sonar.test.inclusions": "tests/**/*.spec.js",
        "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
        "sonar.testExecutionReportPaths": "coverage/test-report.xml"
    }
}, () => process.exit());
