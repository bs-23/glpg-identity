module.exports = {
    verbose: true,
    coverageReporters: [
        "text"
    ],
    collectCoverage: true,
    globalSetup: "./config/server/jest/jest.setup.js",
    globalTeardown: "./config/server/jest/jest.teardown.js"
};
