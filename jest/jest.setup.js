const path = require('path');

const config = require(path.join(process.cwd(), 'src/config/server/config'));

module.exports = async function () {
    await config.initEnvironmentVariables();

    process.env.POSTGRES_CDP_DATABASE = 'cdp_test';

    const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS cdp');

    await sequelize.cdpConnector.query(`
        DO $$ BEGIN
        CREATE AGGREGATE array_concat_agg(anyarray) (
            SFUNC = array_cat,
            STYPE = anyarray
        );
        EXCEPTION
            WHEN duplicate_function THEN NULL;
        END $$;
    `);

    const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
    const Hcp_profile = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp-profile.model'));
    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/consent/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
    const Faq = require(path.join(process.cwd(), 'src/modules/platform/faq/server/faq.model.js'));

    require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
    require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp-consents.model'));
    require(path.join(process.cwd(), 'src/modules/platform/user/server/reset-password.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/password/password-history.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp-archives.model.js'));
    require(path.join(process.cwd(), 'src/modules/application/server/data.model.js'));

    const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
    const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model.js"));
    const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
    const PermissionSetServiceCategories = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model.js"));
    const UserProfilePermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));

    await sequelize.cdpConnector.sync();

    await PermissionSet.bulkCreate(specHelper.permissionSet, { returning: true, ignoreDuplicates: false });
    await ServiceCategory.bulkCreate(specHelper.serviceCategories, { returning: true, ignoreDuplicates: false });
    await UserProfile.bulkCreate(specHelper.userProfile, { returning: true, ignoreDuplicates: false });
    await PermissionSetServiceCategories.bulkCreate(specHelper.permissionSet_serviceCategories, { returning: true, ignoreDuplicates: false });
    await UserProfilePermissionSet.bulkCreate(specHelper.userProfile_permissionSet, { returning: true, ignoreDuplicates: false });
    await Application.create(specHelper.defaultApplication);
    await User.create(specHelper.users.defaultAdmin);
    await User.create(specHelper.users.defaultUser);
    await Hcp_profile.create(specHelper.hcp.defaultUser);
    await ConsentCategory.create(specHelper.consent.demoConsentCategory);
    await Consent.create(specHelper.consent.demoConsent);
    await ConsentLocale.bulkCreate(specHelper.consent.demoConsentLocales, { returning: true, ignoreDuplicates: false });
    await ConsentCountry.bulkCreate(specHelper.consent.demoConsentCountry, { returning: true, ignoreDuplicates: false });
    await Faq.create(specHelper.faq.demoFaq);
};
