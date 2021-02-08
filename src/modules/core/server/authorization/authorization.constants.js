const Modules = {
    PLATFORM: {
        value: 'platform',
        title: 'Management of Customer Data Platform'
    },
    INFORMATION: {
        value: 'information',
        title: 'Information Management'
    },
    PRIVACY: {
        value: 'privacy',
        title: 'Data Privacy & Consent Management'
    },
    BUSINESS_PARTNER: {
        value: 'business-partner',
        title: 'Business Partner Management'
    },
    CLINICAL_TRIALS: {
        value: 'clinical-trials',
        title: 'Clinical Trials Management'
    }
}

const Services = {
    MANAGE_CONSENT: {
        value: 'manage-consent',
        title: 'Manage New Consent'
    },
    CONSENT_COUNTRY: {
        value: 'consent-country',
        title: 'Assign Consent to Country'
    },
    CONSENT_CATEGORY: {
        value: 'consent-category',
        title: 'Configure Consent Category'
    },
    CONSENT_PERFORMANCE: {
        value: 'consent-performance',
        title: 'Generate Data Privacy & Consent Performance Report'
    }
}

module.exports = {
    Modules,
    Services
};
