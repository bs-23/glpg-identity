const path = require('path');

module.exports = {
    verbose: true,
    collectCoverage: true,
    globalSetup: "./jest/jest.setup.js",
    globalTeardown: "./jest/jest.teardown.js",
    testResultsProcessor: "jest-sonar-reporter",
    transform: {
        "^.+\\.jsx?$": "babel-jest",
        ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
    },
    moduleNameMapper: {
        "\\.(css)$": path.join(process.cwd(), '/tests/_mocks_/stub.js')
    }
}
