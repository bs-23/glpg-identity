-- Table: ciam.hcp_profiles

-- DROP TABLE ciam.hcp_profiles;

CREATE TABLE ciam.hcp_profiles
(
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    uuid character varying(255) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    is_active boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT hcp_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT hcp_profiles_email_key UNIQUE (email),
    CONSTRAINT hcp_profiles_uuid_key UNIQUE (uuid)
)
