module.exports = {
    verbose: true,
    collectCoverage: true,
    globalSetup: "./jest/jest.setup.js",
    globalTeardown: "./jest/jest.teardown.js",
    testResultsProcessor: "jest-sonar-reporter"
};
