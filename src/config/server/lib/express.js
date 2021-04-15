const path = require('path');
const helmet = require('helmet');
const hbs = require('express-hbs');
const express = require('express');
const passport = require('passport');
const morganBody = require('morgan-body');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('../config');
const logger = require('./winston');
const nodecache = require('./nodecache');
const swagger = require('./swagger/swagger');
const swaggerUi = require('swagger-ui-express');

module.exports = async function () {
    let app = express();

    app.use(helmet());
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                "default-src": ["'self'",'http://localhost:5000'],
                "script-src": ["'self'", 'https://www.google.com', "https://www.gstatic.com"],
                "script-src-elem": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
                "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
                "font-src": ["'self'", "fonts.googleapis.com", "fonts.gstatic.com", "data:"],
                "frame-src": ["'self'", "https://www.google.com"],
                "img-src": ["'self'", "data:", nodecache.getValue('S3_BUCKET_URL'), "https://a.tile.openstreetmap.org", "https://b.tile.openstreetmap.org", "https://c.tile.openstreetmap.org"],
                "frame-ancestors": ["'self'"],
                "base-uri": ["'self'"],
                "block-all-mixed-content": [],
                "object-src": ["'none'"],
                "script-src-attr": ["'self'"],
                "upgrade-insecure-requests": []
            },
        })
    );
    app.use(compression());
    app.use(cookieParser(nodecache.getValue('CDP_COOKIE_SECRET')));
    app.use(express.json());
    morganBody(app, {
        noColors: true,
        prettify: false,
        filterParameters: ['password'],
        stream: {
            write: message => {
                logger.info(message);
            }
        }
    });
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(process.cwd(), 'wwwroot')));
    app.use('/api-docs', passport.authenticate("swagger-jwt", { session: false, failureRedirect: '/swagger/login' }), swaggerUi.serve, swaggerUi.setup(swagger.specs, swagger.uiOptions));

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
