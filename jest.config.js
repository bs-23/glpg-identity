module.exports = {
    verbose: true,
    coverageReporters: [
        "text"
    ],
    collectCoverage: true,
    globalSetup: "./src/config/server/jest/jest.setup.js",
    globalTeardown: "./src/config/server/jest/jest.teardown.js"
};
