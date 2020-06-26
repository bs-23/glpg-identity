const swaggerJsdoc = require('swagger-jsdoc');
const options = {

  /**
   * List of files to be processed.
   * Exact file path or globs can be added
   * e.g. './routes/*.js' (for globs)
   */
  apis: ['./src/modules/*/server/*.routes.js'],

  basePath: '/',
  swaggerDefinition: {
    info: {
      swagger: '2.0',
      description: 'GLPG CDP portal API Documentation.',
      title: 'GLPG CDP',
      version: '1.0.0',
    },
    servers: ["http://localhost:5050"]
  },
};

const specs = swaggerJsdoc(options);
exports.specs = specs;
