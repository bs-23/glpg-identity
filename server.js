// require('newrelic');

(async function () {
    const path = require('path');
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const app = require('./src/config/server/lib/app');
    app.start();
})();
