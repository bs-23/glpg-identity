const sonarqubeScanner = require("sonarqube-scanner");

sonarqubeScanner({
    serverUrl: "http://localhost:9000",
    options: {
        "sonar.sources": "src/modules/core/server, src/modules/user/server",
        "sonar.tests": "tests",
        "sonar.inclusions": "**",
        "sonar.test.inclusions": "tests/**/*.spec.js",
        "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
        "sonar.testExecutionReportPaths": "coverage/test-report.xml"
    }
}, () => process.exit());
