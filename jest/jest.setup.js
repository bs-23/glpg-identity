const path = require('path');
const config = require(path.join(process.cwd(), 'src/config/server/config'));

module.exports = async function() {
    await config.initEnvironmentVariables();

    process.env.POSTGRES_CDP_DATABASE = 'ciam_test';

    const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS ciam');
    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const Application = require(path.join(process.cwd(), 'src/modules/core/server/application.model'));

    await sequelize.cdpConnector.sync();

    await Application.create(specHelper.defaultApplication);
    await User.create(specHelper.users.defaultUser);
    await User.create(specHelper.users.defaultAdmin);
};
