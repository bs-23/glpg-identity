const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: `GLPG CDP APIs`,
            description: 'API documentation for the GLPG CDP portal',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:5050',
                description: 'Local server',
            },
            {
                url: 'https://cdp-dev.glpg.com',
                description: 'Dev server',
            },
            {
                url: 'https://cdp-stage.glpg.com',
                description: 'Staging server',
            },{
                url: 'https://cdp.glpg.com',
                description: 'Master server',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
	/**
     * List of files to be processed.
     * Exact file path or globs can be added
     * e.g. './routes/*.js' (for globs)
     */
    apis: ['./src/config/server/lib/swagger/*.yaml']
};

const specs = swaggerJsdoc(options);

var uiOptions = {
    swaggerOptions: {
        docExpansion: "list"
    }
};

exports.specs = specs;
exports.uiOptions = uiOptions;
