const path = require('path');
const helmet = require('helmet');
const hbs = require('express-hbs');
const express = require('express');
const config = require('../config');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const swagger = require('./swagger/swagger');
const swaggerUi = require('swagger-ui-express');

module.exports = async function () {
    let app = express();

    app.use(helmet());
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", 'https://www.google.com', "https://www.gstatic.com"],
                "script-src-elem": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
                "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
                "fontSrc": ["'self'", "fonts.googleapis.com", "fonts.gstatic.com", "data:"],
                "frame-src": ["'self'", "https://www.google.com"],
                "img-src": ["'self'", "data:", nodecache.getValue('S3_BUCKET_URL')]
            },
        })
    );
    app.use(compression());
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(process.cwd(), 'wwwroot')));

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger.specs, swagger.uiOptions));

    app.engine('html', hbs.express4({ extname: '.html' }));
    app.set('view engine', 'html');
    app.set('views', path.join(process.cwd(), 'src/modules/core/server'));

    app.set('port', process.env.PORT);

    const globalConfig = config.getGlobalConfig();

    app.locals.jsFiles = globalConfig.client.js;
    app.locals.cssFiles = globalConfig.client.css;

    globalConfig.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    globalConfig.server.strategies.forEach(function (strategy) {
        require(path.resolve(strategy))();
    });

    return app;
};
