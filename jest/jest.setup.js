module.exports = async () => {
    require('dotenv').config();

    process.env.POSTGRES_DATABASE = 'ciam_test';

    const path = require('path');
    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
    const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS ciam');
    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const Application = require(path.join(process.cwd(), 'src/modules/core/server/application.model'));

    await sequelize.cdpConnector.sync();

    await Application.create(specHelper.defaultApplication);
    await User.create(specHelper.users.defaultUser);
    await User.create(specHelper.users.defaultAdmin);
};
