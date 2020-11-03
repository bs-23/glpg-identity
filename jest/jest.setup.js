const path = require('path');

const config = require(path.join(process.cwd(), 'src/config/server/config'));

module.exports = async function() {
    await config.initEnvironmentVariables();

    process.env.POSTGRES_CDP_DATABASE = 'cdp_test';

    const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS cdp');

    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const Hcp_profile = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp-profile.model'));
    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const ApplicationDomain = require(path.join(process.cwd(), 'src/modules/application/server/application-domain.model.js'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/consent/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));

    require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
    require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp-consents.model'));
    require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));
    require(path.join(process.cwd(), 'src/modules/core/server/password/password-history.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp-archives.model.js'));
    const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
    const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
    const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
    const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));

    await sequelize.cdpConnector.sync();

    await Application.create(specHelper.defaultApplication);
    await ApplicationDomain.bulkCreate(specHelper.defaultApplicationDomain, { returning: true, ignoreDuplicates: false });
    await User.create(specHelper.users.defaultAdmin);
    await User.create(specHelper.users.defaultUser);
    await Hcp_profile.create(specHelper.hcp.defaultUser);
    await ConsentCategory.create(specHelper.consent.demoConsentCategory);
    await Consent.create(specHelper.consent.demoConsent);
    await ConsentLocale.bulkCreate(specHelper.consent.demoConsentLocales, { returning: true, ignoreDuplicates: false });
    await ConsentCountry.bulkCreate(specHelper.consent.demoConsentCountry, { returning: true, ignoreDuplicates: false });
    await Permission.bulkCreate(specHelper.permissions, { returning: true, ignoreDuplicates: false });
    await Role.bulkCreate(specHelper.roles, { returning: true, ignoreDuplicates: false });
    await RolePermission.bulkCreate(specHelper.rolePermissions, { returning: true, ignoreDuplicates: false });
    await UserRole.bulkCreate(specHelper.userRoles.defaultAdmin, { returning: true, ignoreDuplicates: false });
    await UserRole.bulkCreate(specHelper.userRoles.defaultUser, { returning: true, ignoreDuplicates: false });
    // await Userpermission.bulkCreate(specHelper.userPermissions.defaultUser, { returning: true, ignoreDuplicates: false })
};
