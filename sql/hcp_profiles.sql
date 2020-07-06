CREATE TABLE ciam.hcp_profiles
(
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    uuid character varying(255) COLLATE pg_catalog."default",
    salutation character varying(255) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    country_code character varying(255) COLLATE pg_catalog."default",
    speciality_onekey character varying(255) COLLATE pg_catalog."default",
    status ciam.enum_hcp_profiles_status,
    created_by uuid,
    updated_by uuid,
    reset_password_token character varying(255) COLLATE pg_catalog."default",
    reset_password_expires character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT hcp_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT hcp_profiles_email_key UNIQUE (email),
    CONSTRAINT hcp_profiles_reset_password_token_key UNIQUE (reset_password_token),
    CONSTRAINT hcp_profiles_uuid_key UNIQUE (uuid)
)

CREATE TYPE ciam.enum_hcp_profiles_status AS ENUM
    ('Approved', 'Pending', 'Rejected');
