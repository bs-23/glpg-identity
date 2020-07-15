const path = require('path');

const config = require(path.join(process.cwd(), 'src/config/server/config'));

module.exports = async function() {
    await config.initEnvironmentVariables();

    process.env.POSTGRES_CDP_DATABASE = 'ciam_test';

    const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS ciam');

    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const Hcp_profile = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_profile.model'));
    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
    require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));
    const Userpermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
    const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));

    await sequelize.cdpConnector.sync();

    await Application.create(specHelper.defaultApplication);
    await User.create(specHelper.users.defaultUser);
    await User.create(specHelper.users.defaultAdmin);
    await Hcp_profile.create(specHelper.hcp.defaultUser);
    await Consent.create(specHelper.consent.demoConsent);
    await Permission.bulkCreate(specHelper.permissions, { returning: true, ignoreDuplicates: false })
    await Userpermission.bulkCreate(specHelper.userPermissions.defaultAdmin, { returning: true, ignoreDuplicates: false })
    await Userpermission.bulkCreate(specHelper.userPermissions.defaultUser, { returning: true, ignoreDuplicates: false })
};
