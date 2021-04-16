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
    const Hcp_profile = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
    const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model.js'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model.js'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model.js'));
    const Faq = require(path.join(process.cwd(), 'src/modules/platform/faq/server/faq.model.js'));
    const Localization = require(path.join(process.cwd(), 'src/modules/core/server/localization/localization.model.js'));
    const PartnerRequest = require(path.join(process.cwd(), 'src/modules/partner/manage-requests/server/partner-request.model.js'));
    const Partner = require(path.join(process.cwd(), 'src/modules/partner/manage-partners/server/partner.model.js'));
    const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));

    require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model.js'));
    require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model.js'));
    require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
    require(path.join(process.cwd(), 'src/modules/platform/user/server/reset-password.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/password/password-history.model'));
    require(path.join(process.cwd(), 'src/modules/platform/application/server/data.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/archive/archive.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model.js'));
    require(path.join(process.cwd(), 'src/modules/partner/manage-partners/server/partner-vendor.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
    require(path.join(process.cwd(), "src/modules/platform/role/server/role.model"));
    require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
    require(path.join(process.cwd(), 'src/modules/core/server/filter/filter.model'));

    const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model"));
    const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service.model"));
    const PermissionSetService = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionset-service.model.js"));
    const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model"));
    const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
    const UserProfilePermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));
    const Countries = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));

    await sequelize.cdpConnector.sync();

    await PermissionSet.bulkCreate(specHelper.permissionSet, { returning: true, ignoreDuplicates: false });
    await ServiceCategory.bulkCreate(specHelper.serviceCategories, { returning: true, ignoreDuplicates: false });
    await UserProfile.bulkCreate(specHelper.userProfile, { returning: true, ignoreDuplicates: false });
    await PermissionSetService.bulkCreate(specHelper.permissionSet_service, { returning: true, ignoreDuplicates: false });
    await UserProfilePermissionSet.bulkCreate(specHelper.userProfile_permissionSet, { returning: true, ignoreDuplicates: false });
    await User.create(specHelper.users.defaultAdmin);
    await User.create(specHelper.users.defaultUser);
    await Application.create(specHelper.defaultApplication);
    await Application.create(specHelper.partnerRequestApplication);
    await Hcp_profile.create(specHelper.hcp.defaultUser);
    await ConsentCategory.create(specHelper.consent.demoConsentCategory);
    await Consent.create(specHelper.consent.demoConsent);
    await ConsentLocale.bulkCreate(specHelper.consent.demoConsentLocales, { returning: true, ignoreDuplicates: false });
    await ConsentCountry.bulkCreate(specHelper.consent.demoConsentCountry, { returning: true, ignoreDuplicates: false });
    await Faq.create(specHelper.faq.demoFaq);
    await Localization.bulkCreate(specHelper.localizations, { returning: true, ignoreDuplicates: false });
    await PartnerRequest.create(specHelper.partner_request);
    await Application.create(specHelper.defaultApplication);
    await Application.create(specHelper.partnerRequestApplication);
    await Countries.bulkCreate(specHelper.countries, { returning: true, ignoreDuplicates: false });
    // await Partner.create(specHelper.partner);
    await Country.bulkCreate(specHelper.countries, { returning: true, ignoreDuplicates: false });
};
