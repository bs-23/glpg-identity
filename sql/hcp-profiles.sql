CREATE TABLE ciam.hcp_profiles
(
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    uuid character varying(20) COLLATE pg_catalog."default" NOT NULL,
    individual_id_onekey character varying(255) COLLATE pg_catalog."default",
    salutation character varying(5) COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    telephone character varying(25) COLLATE pg_catalog."default",
    country_iso2 character varying(2) COLLATE pg_catalog."default" NOT NULL,
    language_code character varying(2) COLLATE pg_catalog."default" NOT NULL,
    locale character varying(5) COLLATE pg_catalog."default" NOT NULL,
    specialty_onekey character varying(20) COLLATE pg_catalog."default" NOT NULL,
    failed_auth_attempt integer DEFAULT 0 NOT NULL,
    status ciam.enum_hcp_profiles_status,
    created_by uuid,
    updated_by uuid,
    reset_password_token character varying(255) COLLATE pg_catalog."default",
    reset_password_expires character varying(255) COLLATE pg_catalog."default",
    origin_url character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    password_updated_at timestamp with time zone,
    CONSTRAINT hcp_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT hcp_profiles_email_key UNIQUE (email),
    CONSTRAINT hcp_profiles_individual_id_onekey_key UNIQUE (individual_id_onekey),
    CONSTRAINT hcp_profiles_reset_password_token_key UNIQUE (reset_password_token),
    CONSTRAINT hcp_profiles_uuid_key UNIQUE (uuid)
)

CREATE TYPE ciam.enum_hcp_profiles_status AS ENUM
    ('self_verified', 'manually_verified', 'consent_pending', 'not_verified');
