-- Table: ciam.hcp_profiles

-- DROP TABLE ciam.hcp_profiles;

CREATE TABLE ciam.hcp_profiles
(
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    is_active boolean,
    one_key_id character varying(255) COLLATE pg_catalog."default",
    created_by uuid,
    updated_by uuid,
    created_at time with time zone NOT NULL,
    updated_at time with time zone NOT NULL,
    CONSTRAINT hcp_profiles_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.hcp_profiles
    OWNER to postgres;