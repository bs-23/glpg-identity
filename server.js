(async function () {
    const path = require('path');
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();
    require('newrelic');
    // if(process.env.NODE_ENV === 'production') {
    //     require('newrelic');
    // }

    const app = require('./src/config/server/lib/app');
    app.start();
})();