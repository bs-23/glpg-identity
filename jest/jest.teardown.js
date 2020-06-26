const path = require('path');
const config = require(path.join(process.cwd(), 'src/config/server/config'));

module.exports = async function() {
    await config.initEnvironmentVariables();

    process.env.POSTGRES_DATABASE = 'ciam_test';

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('DROP SCHEMA "ciam" CASCADE');
    await sequelize.cdpConnector.close();
};
